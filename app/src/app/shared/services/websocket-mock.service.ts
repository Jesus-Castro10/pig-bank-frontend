// src/app/shared/services/websocket-mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { Transaction } from '../../model/transaction';

@Injectable({
  providedIn: 'root'
})
export class WebsocketMockService {
  private transactionUpdateSubject = new Subject<Transaction>();
  transactionUpdates$ = this.transactionUpdateSubject.asObservable();

  private lastTransaction: Transaction | null = null;
  private statuses: Array<'pending' | 'completed' | 'failed'> = ['pending', 'completed', 'failed'];

  constructor() {
    // Simular tiempo real cada 10 segundos
    interval(10000).subscribe(() => {
      if (this.lastTransaction) {
        const newStatus = this.statuses[Math.floor(Math.random() * this.statuses.length)];
        const updatedTransaction = { ...this.lastTransaction, status: newStatus };
        this.transactionUpdateSubject.next(updatedTransaction);
      }
    });
  }

  setLastTransaction(transaction: Transaction): void {
    this.lastTransaction = transaction;
  }
}
