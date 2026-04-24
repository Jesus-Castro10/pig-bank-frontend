import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
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
  private apiPaymentUrl = environment.apiPaymentUrl;

  constructor(private http: HttpClient) { }

  getCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(this.apiCatalogUrl);
  }

  getCards(): Observable<Card[]> {
    const userId = localStorage.getItem('user_uuid');
    return this.http.get<Card[]>(`${this.apiCardUrl}/card/user?userId=${userId}`);
  }

  getTransactions(): Observable<Transaction[]> {
    const userId = localStorage.getItem('user_uuid');
    return this.http.get<Transaction[]>(`${this.apiPaymentUrl}/user/${userId}`);
  }

  createPayment(paymentData: any): Observable<any> {
    return this.getCards().pipe(
      map(cardList => {
        const debitCard = cardList.find(c => c.type === 'DEBIT' && c.status === 'ACTIVATED');
        return {
          service: { ...paymentData },
          cardId: debitCard?.uuid
        };
      }),
      switchMap(body => {
        return this.http.post(this.apiPaymentUrl, body);
      })
    );
  }

  reloadCard(cardId: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiCardUrl}/transactions/save/${cardId}`, { merchant: 'Saving', amount });
  }
}
