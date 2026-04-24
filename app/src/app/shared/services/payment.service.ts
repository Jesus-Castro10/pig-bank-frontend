// src/app/shared/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, takeWhile, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

export interface PaymentResponse {
  traceId: string;
}

export interface PaymentStatusResponse {
  traceId: string;
  status: 'INITIAL' | 'IN_PROGRESS' | 'FINISH' | 'FAILED';
  userId: string;
  cardId: string;
  service: any;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiPaymentUrl = environment.apiPaymentUrl; // Cambiar por URL real
  private activePolling = new Map<string, any>();

  // Subject para notificar cambios de estado
  private paymentStatusSubject = new BehaviorSubject<PaymentStatusResponse | null>(null);
  paymentStatus$ = this.paymentStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  /**
   * Crear un pago usando la tarjeta de débito activa del usuario
   */
  createPayment(paymentData: any): Observable<PaymentResponse> {
    return this.apiService.getCards().pipe(
      map(cardList => {
        const debitCard = cardList.find(c => c.type === 'DEBIT');

        return {
          service: { ...paymentData },
          cardId: debitCard?.uuid
        };
      }),
      switchMap(body => {
        return this.http.post<PaymentResponse>(this.apiPaymentUrl, body);
      })
    );
  }

  /**
   * Consultar el estado de un pago por traceId
   */
  getPaymentStatus(traceId: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(`${this.apiPaymentUrl}/${traceId}`);
  }

  /**
   * Iniciar un pago y comenzar el polling automático
   */
  initiatePayment(paymentData: any): Observable<PaymentStatusResponse> {
    let initialStatus: PaymentStatusResponse | null = null;

    return new Observable<PaymentStatusResponse>(observer => {
      // Paso 1: Crear el pago
      this.createPayment(paymentData).subscribe({
        next: (response) => {
          const traceId = response.traceId;
          console.log('Pago iniciado con traceId:', traceId);
          // Paso 2: Consultar estado inicial
          this.getPaymentStatus(traceId).subscribe({
            next: (status) => {
              initialStatus = status;
              this.paymentStatusSubject.next(status);
              observer.next(status);

              // Paso 3: Iniciar polling si el estado no es FINAL
              if (status.status !== 'FINISH' && status.status !== 'FAILED') {
                this.startPolling(traceId, observer);
              } else {
                observer.complete();
              }
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Iniciar polling para un traceId específico
   */
  private startPolling(traceId: string, observer: any): void {
    // Detener polling anterior si existe
    if (this.activePolling.has(traceId)) {
      clearInterval(this.activePolling.get(traceId));
    }

    let attempts = 0;
    const maxAttempts = 15; // 15 intentos * 2 segundos = 30 segundos máximo

    const intervalId = setInterval(() => {
      attempts++;

      this.getPaymentStatus(traceId).subscribe({
        next: (status) => {
          this.paymentStatusSubject.next(status);
          observer.next(status);

          // Si el pago terminó (FINISH o FAILED), detener polling
          if (status.status === 'FINISH' || status.status === 'FAILED') {
            clearInterval(intervalId);
            this.activePolling.delete(traceId);
            observer.complete();
          }

          // Timeout después de muchos intentos
          if (attempts >= maxAttempts && status.status !== 'FINISH' && status.status !== 'FAILED') {
            clearInterval(intervalId);
            this.activePolling.delete(traceId);
            observer.error(new Error('Tiempo de espera agotado. El pago está tardando más de lo normal.'));
          }
        },
        error: (err) => {
          console.error(`Error polling payment ${traceId}:`, err);
          if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            this.activePolling.delete(traceId);
            observer.error(err);
          }
        }
      });
    }, 2000); // Polling cada 2 segundos

    this.activePolling.set(traceId, intervalId);
  }

  /**
   * Detener polling para una transacción específica
   */
  stopPolling(traceId: string): void {
    if (this.activePolling.has(traceId)) {
      clearInterval(this.activePolling.get(traceId));
      this.activePolling.delete(traceId);
    }
  }

  /**
   * Detener todo el polling activo
   */
  stopAllPolling(): void {
    this.activePolling.forEach((intervalId, traceId) => {
      clearInterval(intervalId);
    });
    this.activePolling.clear();
  }
}
