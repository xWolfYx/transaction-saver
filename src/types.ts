export const PAYMENT_METHOD = {
	cash: 'Cash',
	card: 'Card',
	transfer: 'Transfer',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHOD;

export interface Checkout {
	id: string;
	method: PaymentMethod;
	amount: number;
	timestamp: string;
}
