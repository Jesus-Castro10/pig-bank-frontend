// src/app/shared/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogItem } from '../../model/catalog-item';
import { Card } from '../../model/card';
import { Transaction } from '../../model/transaction';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.apiUrl}/catalog`);
  }

  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/cards`);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  createPayment(paymentData: any): Observable<any> {
    // Endpoint de pago pendiente por ahora
    console.log('Simulando envío de pago:', paymentData);
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Pago simulado', transactionId: Math.random() });
        observer.complete();
      }, 500);
    });
  }
}
