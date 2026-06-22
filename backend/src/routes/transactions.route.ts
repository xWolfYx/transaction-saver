import { Router, type Router as RouterType } from "express";
import * as CheckoutController from "../controllers/checkouts.controller.js";

const router: RouterType = Router();

router.get("/", CheckoutController.getAll);
router.post("/", CheckoutController.create);
router.put("/:id", CheckoutController.update);
router.delete("/:id", CheckoutController.remove);

export default router;