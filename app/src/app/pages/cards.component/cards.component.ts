import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { Card } from '../../model/card';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cards.component',
  standalone: false,
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss',
})
export class CardsComponent implements OnInit {
  cards: Card[] = [];
  loading = false;
  selectedCard: Card | null = null;
  creditCard: Card | null = null;
  debitCard: Card | null = null;
  showActionModal = false;
  actionType: 'reload' | 'pay' | null = null;

  // Montos para recarga
  reloadAmounts = [50000, 100000, 200000, 500000];
  selectedAmount: number = 100000;

  constructor(private apiService: ApiService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.spinner.show()
    this.apiService.getCards().subscribe({
      next: (data) => {
        this.cards = data;
        this.creditCard = this.cards.find(c => c.type === 'CREDIT') || null;
        this.debitCard = this.cards.find(c => c.type === 'DEBIT') || null;
        this.spinner.hide()
      }
    });
    // Simulación de datos (esto vendría del backend)
    // setTimeout(() => {
    //   this.cards = [
    //     {
    //       uuid: 1,
    //       type: 'credit',
    //       cardNumber: '**** **** **** 2573',
    //       cardHolder: 'JESUS RODRIGUEZ',
    //       expiryDate: '12/28',
    //       balance: 0,
    //       status: 'inactive',
    //       purchasesCount: 3,
    //       requiredPurchases: 10
    //     },
    //     {
    //       uuid: 2,
    //       type: 'debit',
    //       cardNumber: '**** **** **** 6329',
    //       cardHolder: 'JESUS RODRIGUEZ',
    //       expiryDate: '12/28',
    //       balance: 1250000,
    //       status: 'active',
    //       purchasesCount: 3,
    //       requiredPurchases: 10
    //     }
    //   ];
    //   this.loading = false;
    // }, 500);


  }

  // Calcular compras restantes
  getRemainingPurchases(card: Card): number {
    return card.requiredPurchases - card.purchasesCount;
  }

  // Calcular porcentaje de progreso
  getProgressPercent(card: Card): number {
    return (card.purchasesCount / card.requiredPurchases) * 100;
  }

  // Al tocar una tarjeta
  onCardTap(card: Card): void {
    this.selectedCard = card;

    if (card.type === 'CREDIT' && card.status === 'PENDING') {
      // Tarjeta de crédito inactiva - mostrar progreso
      this.actionType = null;
      this.showActionModal = true;
    } else if (card.type === 'DEBIT' && card.status === 'ACTIVATED') {
      // Tarjeta de débito activa - mostrar opciones
      this.actionType = null;
      this.showActionModal = true;
    } else if (card.type === 'CREDIT' && card.status === 'ACTIVATED') {
      // Tarjeta de crédito activa - opciones de pago
      this.actionType = null;
      this.showActionModal = true;
    }
  }

  // Recargar tarjeta de débito
  reloadCard(): void {
    this.actionType = 'reload';
  }

  // Pagar con tarjeta de débito/crédito
  payWithCard(): void {
    this.actionType = 'pay';
  }

  // Confirmar recarga
  confirmReload(): void {
    if (!this.selectedCard || this.selectedCard.type !== 'DEBIT') return;

    // Simular recarga
    this.selectedCard.balance += this.selectedAmount;
    alert(`✅ ¡Recarga exitosa!\nSe añadieron $${this.selectedAmount.toLocaleString()} a tu tarjeta de débito.\nNuevo saldo: $${this.selectedCard.balance.toLocaleString()}`);
    this.closeModal();
  }

  // Confirmar pago (simulado)
  confirmPayment(): void {
    if (!this.selectedCard) return;

    const amount = prompt('💰 Ingresa el monto a pagar:', '50000');
    if (amount && !isNaN(Number(amount))) {
      const monto = Number(amount);
      if (this.selectedCard.balance >= monto) {
        this.selectedCard.balance -= monto;

        // Incrementar contador de compras para la tarjeta de débito
        if (this.selectedCard.type === 'DEBIT') {
          this.selectedCard.purchasesCount++;

          // Verificar si se activa la tarjeta de crédito
          if (this.selectedCard.purchasesCount >= this.selectedCard.requiredPurchases) {
            const creditCard = this.cards.find(c => c.type === 'CREDIT');
            if (creditCard && creditCard.status === 'PENDING') {
              creditCard.status = 'ACTIVATED';
              alert('🎉 ¡Felicidades! Tu tarjeta de crédito ha sido activada. Ahora puedes usarla para tus compras.');
            }
          }
        }

        alert(`✅ Pago de $${monto.toLocaleString()} realizado exitosamente`);
      } else {
        alert('❌ Saldo insuficiente para realizar este pago');
      }
    }
    this.closeModal();
  }

  closeModal(): void {
    this.showActionModal = false;
    this.selectedCard = null;
    this.actionType = null;
    this.selectedAmount = 100000;
  }

  getCardTypeIcon(type: string): string {
    return type === 'CREDIT' ? '💳' : '💎';
  }

  getCardTypeName(type: string): string {
    return type === 'CREDIT' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito';
  }
}
