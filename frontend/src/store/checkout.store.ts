import type { Checkout } from "@tally/shared";
import { create } from "zustand";
import * as api from "../lib/api";

interface CheckoutStore {
	checkouts: Checkout[];
	isLoading: boolean;
	error: string | null;
	fetchCheckouts: () => Promise<void>;
	addCheckout: (data: Omit<Checkout, "id">) => Promise<void>;
	updateCheckout: (
		id: string,
		data: Partial<Omit<Checkout, "id">>,
	) => Promise<void>;
	deleteCheckout: (id: string) => Promise<void>;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
	checkouts: [],
	isLoading: false,
	error: null,

	fetchCheckouts: async () => {
		set({ isLoading: true, error: null });
		try {
			const checkouts = await api.fetchCheckouts();
			set({ checkouts, isLoading: false });
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : "Failed to fetch checkouts",
				isLoading: false,
			});
		}
	},

	addCheckout: async (data) => {
		try {
			const checkout = await api.createCheckout(data);
			set((state) => ({ checkouts: [checkout, ...state.checkouts] }));
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : "Failed to add checkout",
			});
			throw err;
		}
	},

	updateCheckout: async (id, data) => {
		try {
			const updated = await api.updateCheckout(id, data);
			set((state) => ({
				checkouts: state.checkouts.map((c) =>
					c.id === updated.id ? updated : c,
				),
			}));
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : "Failed to update checkout",
			});
			throw err;
		}
	},

	deleteCheckout: async (id) => {
		try {
			await api.deleteCheckout(id);
			set((state) => ({
				checkouts: state.checkouts.filter((c) => c.id !== id),
			}));
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : "Failed to delete checkout",
			});
			throw err;
		}
	},
}));
