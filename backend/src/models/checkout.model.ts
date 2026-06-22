import fs from "node:fs/promises";
import path from "node:path";
import { type Checkout } from "@transaction-saver/shared";

const DATA_FILE = path.join(import.meta.dirname, "../../data/checkouts.json");

export async function getAll(): Promise<Checkout[]> {
	try {
		const raw = await fs.readFile(DATA_FILE, "utf-8");
		const checkouts = JSON.parse(raw) as Checkout[];
		return checkouts.sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	} catch {
		return [];
	}
}

export async function getById(id: string): Promise<Checkout | null> {
	const checkouts = await getAll();
	return checkouts.find((c) => c.id === id) ?? null;
}

export async function create(
	data: Omit<Checkout, "id">,
): Promise<Checkout> {
	const checkouts = await getAll();
	const newCheckout: Checkout = {
		id: crypto.randomUUID(),
		...data,
	};
	checkouts.unshift(newCheckout);
	await fs.writeFile(DATA_FILE, JSON.stringify(checkouts, null, 2));
	return newCheckout;
}

export async function update(
	id: string,
	data: Partial<Omit<Checkout, "id">>,
): Promise<Checkout | null> {
	const checkouts = await getAll();
	const index = checkouts.findIndex((c) => c.id === id);
	if (index === -1) return null;

	checkouts[index] = { ...checkouts[index]!, ...data } as Checkout;
	await fs.writeFile(DATA_FILE, JSON.stringify(checkouts, null, 2));
	return checkouts[index]!;
}

export async function remove(id: string): Promise<boolean> {
	const checkouts = await getAll();
	const index = checkouts.findIndex((c) => c.id === id);
	if (index === -1) return false;

	checkouts.splice(index, 1);
	await fs.writeFile(DATA_FILE, JSON.stringify(checkouts, null, 2));
	return true;
}