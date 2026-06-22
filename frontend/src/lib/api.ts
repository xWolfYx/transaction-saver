import type { Checkout } from "@transaction-saver/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const API_PATH = `${API_BASE}/api/checkouts`;

class ApiError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
}

async function request<T>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const res = await fetch(path, {
		headers: { "Content-Type": "application/json" },
		...options,
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new ApiError(
			res.status,
			(body as { message?: string }).message ?? res.statusText,
		);
	}

	if (res.status === 204) return undefined as T;
	return res.json() as Promise<T>;
}

export async function fetchCheckouts(): Promise<Checkout[]> {
	return request<Checkout[]>(API_PATH);
}

export async function createCheckout(
	data: Omit<Checkout, "id">,
): Promise<Checkout> {
	return request<Checkout>(API_PATH, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function updateCheckout(
	id: string,
	data: Partial<Omit<Checkout, "id">>,
): Promise<Checkout> {
	return request<Checkout>(`${API_PATH}/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export async function deleteCheckout(id: string): Promise<void> {
	return request<void>(`${API_PATH}/${id}`, {
		method: "DELETE",
	});
}

export { ApiError };