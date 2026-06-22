export const PAYMENT_METHOD = {
	cash: "Cash",
	card: "Card",
	transfer: "Transfer",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHOD;

/** 1 GEL = 100 tetri */
export const GEL_DIVISOR = 100;

export interface Checkout {
	id: string;
	method: PaymentMethod;
	/** Amount stored in tetri (smallest unit); divide by GEL_DIVISOR for display */
	amount: number;
	timestamp: string;
}