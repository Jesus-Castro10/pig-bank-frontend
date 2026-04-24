import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { Card } from '../../model/card';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-cards',
  standalone: false,
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss',
})
export class CardsComponent implements OnInit {
  private refreshTrigger = new BehaviorSubject<void>(undefined);

  cards$: Observable<Card[]> = this.refreshTrigger.pipe(
    tap(() => this.spinner.show()),
    switchMap(() => this.apiService.getCards()),
    tap(() => this.spinner.hide()),
    shareReplay(1),
    catchError((err) => {
      this.spinner.hide();
      console.error('Error cargando tarjetas:', err);
      return of([]);
    })
  );

  debitCard$ = this.cards$.pipe(
    map(cards => cards.find(c => c.type === 'DEBIT') || null)
  );

  creditCard$ = this.cards$.pipe(
    map(cards => cards.find(c => c.type === 'CREDIT') || null)
  );

  showActionModal = false;
  actionType: 'reload' | 'pay' | null = null;
  selectedCard: Card | null = null;
  selectedAmount: number = 100000;
  reloadAmounts = [50000, 100000, 200000, 500000];

  constructor(
    private apiService: ApiService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {

  }

  loadCards(): void {
    this.refreshTrigger.next();
  }

  onCardTap(card: Card): void {
    this.selectedCard = card;
    this.actionType = null;
    this.showActionModal = true;
  }

  confirmReload(): void {
    if (!this.selectedCard || this.selectedCard.type !== 'DEBIT') return;

    this.spinner.show();
    this.apiService.reloadCard(this.selectedCard.uuid.toString(), this.selectedAmount).subscribe({
      next: () => {
        this.loadCards();
        this.closeModal();
      },
      error: () => {
        this.spinner.hide();
        alert('Error al recargar.');
      }
    });
  }

  closeModal(): void {
    this.showActionModal = false;
    this.selectedCard = null;
    this.actionType = null;
  }

  getCardTypeIcon(type: string): string { return type === 'CREDIT' ? '💳' : '💎'; }
  getCardTypeName(type: string): string { return type === 'CREDIT' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'; }

  reloadCard(card: Card): void {
    this.selectedCard = card;
    this.actionType = 'reload';
    this.showActionModal = true;
  }
}
