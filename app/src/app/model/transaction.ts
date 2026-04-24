export interface Transaction {
  id: number;
  service: {
    categoria: string
    detalles: string
    estado: string
    id: number
    plan: string
    precio_mensual: number
    proveedor: string
    servicio: string
  }
  status: string;
  timestamp: Date;
  cardId: number;
}
