import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogItem } from '../../model/catalog-item';
import { Card } from '../../model/card';
import { Transaction } from '../../model/transaction';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiAuthUrl = environment.apiAuthUrl;
  private apiCardUrl = environment.apiCardUrl;
  private apiCatalogUrl = environment.apiCatalogUrl;

  constructor(private http: HttpClient) {}

  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(this.apiCatalogUrl);
  }

  getCards(): Observable<Card[]> {
    const userId = localStorage.getItem('user_uuid');
    return this.http.get<Card[]>(`${this.apiCardUrl}/user?userId=${userId}`);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiAuthUrl}/transactions`);
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
