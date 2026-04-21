export interface Transaction {
  id: number;
  userId: number;
  serviceId: number;
  serviceName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  cardId: number;
}
