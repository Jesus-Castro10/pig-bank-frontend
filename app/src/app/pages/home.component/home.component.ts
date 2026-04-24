import { Component } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { Card } from '../../model/card';
import { Transaction } from '../../model/transaction';
import { WebsocketMockService } from '../../shared/services/websocket-mock.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import { catchError, map, scan, shareReplay, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  cards$: Observable<Card[]>;
  transactions$: Observable<Transaction[]>;
  dashboardData$: Observable<any>;

  private refreshTrigger = new BehaviorSubject<void>(undefined);

  constructor(
    private apiService: ApiService,
    private wsMock: WebsocketMockService,
    private spinner: NgxSpinnerService
  ) {

    this.cards$ = this.refreshTrigger.pipe(
      tap(() => this.spinner.show()),
      switchMap(() => this.apiService.getCards()),
      tap(() => this.spinner.hide()),
      shareReplay(1)
    );

    this.transactions$ = this.apiService.getTransactions().pipe(
      switchMap(initial => merge(of(initial), this.wsMock.transactionUpdates$).pipe(
        scan((acc: Transaction[], curr: Transaction | Transaction[]) => {
          if (Array.isArray(curr)) return curr;
          const index = acc.findIndex(t => t.id === curr.id);
          if (index !== -1) {
            acc[index] = curr;
            return [...acc];
          }
          return [curr, ...acc];
        }, []),
        tap(list => this.wsMock.setLastTransaction(list[0]))
      )),
      shareReplay(1)
    );

    this.dashboardData$ = combineLatest([this.cards$, this.transactions$]).pipe(
      map(([cards, transactions]) => {
        const mainCard = cards.find(c => c.status === 'ACTIVATED') || cards[0];
        const currentMonth = new Date().getMonth();
        const monthly = transactions.filter(t =>
          new Date(t.timestamp).getMonth() === currentMonth && t.status === 'completed'
        );

        return {
          balance: mainCard?.balance || 0,
          cardStatus: mainCard?.status || 'PENDING',
          monthlyTransactions: monthly.length,
          monthlyTotal: monthly.reduce((sum, t) => sum + (t.service?.precio_mensual || 0), 0),
          lastTransactionStatus: transactions[0]?.status || ''
        };
      }),
      catchError(() => of({ balance: 0, cardStatus: 'inactive', monthlyTransactions: 0, monthlyTotal: 0, lastTransactionStatus: '' }))
    );
  }
}
