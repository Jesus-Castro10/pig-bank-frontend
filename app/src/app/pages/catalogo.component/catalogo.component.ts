import { Component, OnInit } from '@angular/core';
import { CatalogItem } from '../../model/catalog-item';
import { ApiService } from '../../shared/services/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-catalogo.component',
  standalone: false,
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogComponent implements OnInit {
  catalogItems$!: Observable<CatalogItem[]>;
  payingServiceId: number | null = null;

  constructor(private apiService: ApiService,
    private spinner: NgxSpinnerService
  ) { }

  async ngOnInit() {
    this.loadCatalog();
  }

  async loadCatalog() {
    // await this.spinner.show();
    this.catalogItems$ = this.apiService.getCatalog();

  }

  payService(catalogItem: CatalogItem): void {
    this.payingServiceId = catalogItem.id;

    const paymentData = {
      serviceId: catalogItem.id,
      serviceName: catalogItem.servicio,
      amount: catalogItem.precio_mensual,
      provider: catalogItem.proveedor,
      category: catalogItem.categoria
    };

    this.apiService.createPayment(paymentData).subscribe({
      next: (response) => {
        console.log('Pago enviado exitosamente:', response);
        alert(`Pago de $${catalogItem.precio_mensual} para ${catalogItem.servicio} enviado correctamente`);
        this.payingServiceId = null;
      },
      error: (err) => {
        console.error('Error al procesar pago:', err);
        alert('Error al procesar el pago. Intenta nuevamente.');
        this.payingServiceId = null;
      }
    });
  }
}
