export interface Card {
   id: number;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  status: 'active' | 'inactive';
  userId: number;
  purchasesCount?: number;
}
