import { PaymentService, PaymentStatusResponse } from './../../shared/services/payment.service';
import { Component, OnInit } from '@angular/core';
import { CatalogItem } from '../../model/catalog-item';
import { ApiService } from '../../shared/services/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-catalogo.component',
  standalone: false,
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogComponent implements OnInit {
  catalogItems$!: Observable<CatalogItem[]>;
  payingServiceId: number | null = null;
  currentPaymentStatus: PaymentStatusResponse | null = null;
  private paymentSubscription: Subscription | null = null;

  // Feedback visual
  paymentMessage: string = '';
  showPaymentFeedback = false;
  paymentProgress = 0;

  constructor(private apiService: ApiService,
    private paymentService: PaymentService
  ) { }

  async ngOnInit() {
    this.loadCatalog();
  }

  async loadCatalog() {
    this.catalogItems$ = this.apiService.getCatalog();
  }

  // payService(catalogItem: CatalogItem): void {
  //   this.payingServiceId = catalogItem.id;

  //   const paymentData = {
  //     id: catalogItem.id,
  //     servicio: catalogItem.servicio,
  //     precio_mensual: catalogItem.precio_mensual,
  //     proveedor: catalogItem.proveedor,
  //     categoria: catalogItem.categoria,
  //     plan: catalogItem.plan,
  //     detalles: catalogItem.detalles,
  //     estado: catalogItem.estado
  //   };

  //   this.apiService.createPayment(paymentData).subscribe({
  //     next: (response) => {
  //       console.log('Pago enviado exitosamente:', response);
  //       alert(`Pago de $${catalogItem.precio_mensual} para ${catalogItem.servicio} enviado correctamente`);
  //       this.payingServiceId = null;
  //     },
  //     error: (err) => {
  //       console.error('Error al procesar pago:', err);
  //       alert('Error al procesar el pago. Intenta nuevamente.');
  //       this.payingServiceId = null;
  //     }
  //   });
  // }

  payService(service: CatalogItem): void {
    this.payingServiceId = service.id;
    this.showPaymentFeedback = true;
    this.paymentProgress = 0;
    this.paymentMessage = '📤 Iniciando pago...';

    const paymentData = {
      id: service.id,
      servicio: service.servicio,
      precio_mensual: service.precio_mensual,
      proveedor: service.proveedor,
      categoria: service.categoria,
      plan: service.plan,
      detalles: service.detalles,
      estado: service.estado
    };

    // Iniciar pago con polling automático
    this.paymentSubscription = this.paymentService.initiatePayment(paymentData).subscribe({
      next: (status) => {
        this.currentPaymentStatus = status;
        this.updatePaymentFeedback(status);
      },
      error: (err) => {
        console.error('Error en pago:', err);
        this.paymentMessage = `❌ ${err.message || 'Error al procesar el pago. Intenta nuevamente.'}`;
        setTimeout(() => this.resetPaymentState(), 3000);
      },
      complete: () => {
        // El polling terminó (FINISH o FAILED)
        if (this.currentPaymentStatus?.status === 'FINISH') {
          this.paymentMessage = `✅ ¡Pago exitoso! Monto: $${(this.currentPaymentStatus.service?.precio_mensual || 0).toLocaleString()}`;
          setTimeout(() => this.resetPaymentState(), 3000);
        } else if (this.currentPaymentStatus?.status === 'FAILED') {
          this.paymentMessage = `❌ El pago ha fallado. Verifica tu saldo o intenta más tarde.`;
          setTimeout(() => this.resetPaymentState(), 4000);
        }
      }
    });
  }

  private updatePaymentFeedback(status: PaymentStatusResponse): void {
    switch(status.status) {
      case 'INITIAL':
        this.paymentMessage = '📝 Pago registrado, iniciando validación...';
        this.paymentProgress = 10;
        break;
      case 'IN_PROGRESS':
        this.paymentMessage = '⏳ Procesando pago... Validación financiera en curso (SQS + Lambda)';
        this.paymentProgress = 50;
        break;
      case 'FINISH':
        this.paymentMessage = '✅ Pago completado exitosamente';
        this.paymentProgress = 100;
        break;
      case 'FAILED':
        this.paymentMessage = '❌ Pago fallido - Saldo insuficiente o tarjeta inválida';
        this.paymentProgress = 100;
        break;
    }
  }

  private resetPaymentState(): void {
    setTimeout(() => {
      this.payingServiceId = null;
      this.showPaymentFeedback = false;
      this.paymentMessage = '';
      this.paymentProgress = 0;
      this.currentPaymentStatus = null;
      if (this.paymentSubscription) {
        this.paymentSubscription.unsubscribe();
        this.paymentSubscription = null;
      }
    }, 1000);
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'INITIAL': return '📝';
      case 'IN_PROGRESS': return '⏳';
      case 'FINISH': return '✅';
      case 'FAILED': return '❌';
      default: return '🔄';
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'INITIAL': return 'initial';
      case 'IN_PROGRESS': return 'in_progress';
      case 'FINISH': return 'finish';
      case 'FAILED': return 'failed';
      default: return '';
    }
  }
}
