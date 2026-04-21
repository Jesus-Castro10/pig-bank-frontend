import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { Card } from '../../model/card';
import { Transaction } from '../../model/transaction';
import { Subscription } from 'rxjs';
import { WebsocketMockService } from '../../shared/services/websocket-mock.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home.component',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  cards: Card[] = [];
  transactions: Transaction[] = [];
  lastTransactionUpdate: Subscription | null = null;

  dashboardData = {
    balance: 150000,
    cardStatus: 'inactive',
    monthlyTransactions: 0,
    monthlyTotal: 0,
    lastTransactionStatus: ''
  };

  constructor(
    private apiService: ApiService,
    private wsMock: WebsocketMockService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCards();
    this.loadTransactions();
    this.listenToRealtimeUpdates();
  }

  loadCards(): void {
    this.apiService.getCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        const mainCard = cards.find(c => c.status === 'active') || cards[0];
        this.dashboardData.cardStatus = mainCard?.status || 'inactive';
      },
      error: (err) => console.error('Error loading cards:', err)
    });
  }

  loadTransactions(): void {
    this.apiService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        const currentMonth = new Date().getMonth();
        const monthlyTransactions = transactions.filter(t =>
          new Date(t.date).getMonth() === currentMonth && t.status === 'completed'
        );
        this.dashboardData.monthlyTransactions = monthlyTransactions.length;
        this.dashboardData.monthlyTotal = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

        if (transactions.length > 0) {
          this.wsMock.setLastTransaction(transactions[0]);
        }
      },
      error: (err) => console.error('Error loading transactions:', err)
    });
  }

  listenToRealtimeUpdates(): void {
    this.lastTransactionUpdate = this.wsMock.transactionUpdates$.subscribe({
      next: (updatedTransaction) => {
        this.dashboardData.lastTransactionStatus = updatedTransaction.status;
        // Actualizar la transacción en la lista local
        const index = this.transactions.findIndex(t => t.id === updatedTransaction.id);
        if (index !== -1) {
          this.transactions[index] = updatedTransaction;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.lastTransactionUpdate) {
      this.lastTransactionUpdate.unsubscribe();
    }
  }
}
