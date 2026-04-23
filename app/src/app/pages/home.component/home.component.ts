import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { Card } from '../../model/card';
import { Transaction } from '../../model/transaction';
import { Subscription } from 'rxjs';
import { WebsocketMockService } from '../../shared/services/websocket-mock.service';
import { AuthService } from '../../core/services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

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
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit() {
    await this.spinner.show();
    await this.loadCards();
    await this.loadTransactions();
    await this.listenToRealtimeUpdates();
    await this.spinner.hide();
  }

  async loadCards() {
    this.apiService.getCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        const mainCard = cards.find(c => c.status === 'ACTIVATED') || cards[0];
        this.dashboardData.cardStatus = mainCard?.status || 'PENDING';
      },
      error: (err) => console.error('Error loading cards:', err)
    });
  }

  async loadTransactions() {
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

  async listenToRealtimeUpdates() {
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
