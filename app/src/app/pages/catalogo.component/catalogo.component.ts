import { Component, OnInit } from '@angular/core';
import { CatalogItem } from '../../model/catalog-item';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-catalogo.component',
  standalone: false,
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogComponent implements OnInit {
  catalogItems: CatalogItem[] = [];
  loading = false;
  payingServiceId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.loading = true;
    this.apiService.getCatalog().subscribe({
      next: (services) => {
        this.catalogItems = services;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading catalog:', err);
        this.loading = false;
      }
    });
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
