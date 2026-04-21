export interface CatalogItem {
  id: number;
  categoria: string;
  proveedor: string;
  servicio: string;
  plan: string;
  precio_mensual: number;
  detalles: string;
  estado: 'Activo' | 'Inactivo';
}
