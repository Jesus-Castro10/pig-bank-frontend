export interface Card {
  uuid: number;
  type: 'CREDIT' | 'DEBIT';
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  balance: number;
  status: 'ACTIVATED' | 'PENDING';
  purchasesCount: number;      // Compras realizadas con débito
  requiredPurchases: number;
}
