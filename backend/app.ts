import cors from "cors";
import express from "express";
import { errorHandler } from "./src/middleware/error-handler.js";
import checkoutRoutes from "./src/routes/transactions.route.js";

const PORT = 3000;

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/checkouts", checkoutRoutes);
app.use(errorHandler);

app.listen(PORT, () =>
	console.log(`Server is running on http://localhost:${PORT}`),
);
