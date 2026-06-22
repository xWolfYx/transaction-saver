import type { NextFunction, Request, Response } from "express";
import * as CheckoutModel from "../models/checkout.model.js";

export async function getAll(
	_req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const checkouts = await CheckoutModel.getAll();
		res.json(checkouts);
	} catch (err) {
		next(err);
	}
}

export async function create(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { method, amount, timestamp } = req.body;
		if (!method || amount == null || !timestamp) {
			res.status(400).json({ message: "Missing required fields: method, amount, timestamp" });
			return;
		}

		const created = await CheckoutModel.create({ method, amount, timestamp });
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function update(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const id = req.params.id as string;
		const updated = await CheckoutModel.update(id, req.body);
		if (!updated) {
			res.status(404).json({ message: "Checkout not found" });
			return;
		}
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function remove(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const id = req.params.id as string;
		const deleted = await CheckoutModel.remove(id);
		if (!deleted) {
			res.status(404).json({ message: "Checkout not found" });
			return;
		}
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}