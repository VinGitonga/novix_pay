import express from "express";
import cors from "cors";
import { morganMiddleware } from "./middlewares/morgan.middleware";
import DatabaseConnection from "./db/connect";
import { logger } from "./logger/winston";
import accountRouter from "./routes/account.route";
import { APP_PORT } from "./constants";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);
app.use(cors());

async function initializeDatabase() {
	try {
		const dbConnection = DatabaseConnection.getInstance();
		await dbConnection.connect();
		logger.info("Database connected successfully");
	} catch (error) {
		logger.error("Failed to connect to the database", error);
		process.exit(1);
	}
}

async function main() {
	await initializeDatabase();

	app.get("/", (req, res) => {
		res.send("Hello Novix Pay");
	});
	app.use("/api/accounts", accountRouter);

	app.get(/(.*)/, (req: express.Request, res: express.Response) => {
		res.status(500).json({ success: false, msg: "Internal Server Error" });
	});

	app.listen(APP_PORT, () => {
		logger.info(`Server started at http://localhost:${APP_PORT}`);
	});
}

main();
