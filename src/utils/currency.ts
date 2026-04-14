export function formatCurrency(amount: number, currency = 'DZD'): string {
  return `${amount.toLocaleString('fr-DZ')} ${currency}`;
}

export type PaymentStatus = 'underpaid' | 'paid' | 'overpaid';

export function getPaymentStatus(price: number, paid: number): PaymentStatus {
  if (paid < price) return 'underpaid';
  if (paid > price) return 'overpaid';
  return 'paid';
}

export function getBalance(price: number, paid: number): number {
  return paid - price;
}
