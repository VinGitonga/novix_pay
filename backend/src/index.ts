import express from "express";
import cors from "cors";
import { morganMiddleware } from "./middlewares/morgan.middleware";
import DatabaseConnection from "./db/connect";
import { logger } from "./logger/winston";
import accountRouter from "./routes/account.route";
import { APP_PORT } from "./constants";
import paymentRouter from "./routes/payment.route";
import facilitatorRouter from "./routes/facilitator.route";
import { paymentMiddleware, Resource } from "x402-express";
import { Network, PaymentPayload, PaymentRequirements, Price, settleResponseHeader } from "x402/types";
import { findMatchingPaymentRequirements, processPriceToAtomicAmount, getNetworkId } from "x402/shared";
import { useFacilitator } from "x402/verify";
import { exact } from "x402/schemes";
import { config } from "x402/types/shared/evm";
import planRouter from "./routes/plan.route";
import usdcRouter from "./routes/usdc-test.route";

const app = express();

const payTo = "0x68EcA16c451C55fC4613a2f982090b65234C8D8a";
const facilitatorUrl = "http://localhost:6099";
const x402Version = 1;
const { verify, settle } = useFacilitator({ url: facilitatorUrl });

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

/**
 * Creates payment requirements for a given price and network
 *
 * @param price - The price to be paid for the resource
 * @param network - The blockchain network to use for payment
 * @param resource - The resource being accessed
 * @param description - Optional description of the payment
 * @returns An array of payment requirements
 */
function createExactPaymentRequirements(price: Price, network: Network, resource: Resource, description = ""): PaymentRequirements {
	const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
	if ("error" in atomicAmountForAsset) {
		throw new Error(atomicAmountForAsset.error);
	}

	const { maxAmountRequired, asset } = atomicAmountForAsset;

	// Fix the USDC name for Etherlink testnet
	const usdcName = network === "etherlink-testnet" ? "USD Coin" : asset.eip712.name;
	
	return {
		scheme: "exact",
		network,
		maxAmountRequired,
		resource,
		description,
		mimeType: "application/json",
		payTo: payTo,
		maxTimeoutSeconds: 300, // Match the frontend timeout
		asset: asset.address,
		outputSchema: undefined,
		extra: {
			name: usdcName,
			version: asset.eip712.version,
		},
	};
}

/**
 * Verifies a payment and handles the response
 *
 * @param req - The Express request object
 * @param res - The Express response object
 * @param paymentRequirements - The payment requirements to verify against
 * @returns A promise that resolves to true if payment is valid, false otherwise
 */
async function verifyPayment(req: express.Request, res: express.Response, paymentRequirements: PaymentRequirements[]): Promise<boolean> {
	const payment = req.header("X-PAYMENT");
	if (!payment) {
		res.status(402).json({
			x402Version,
			error: "X-PAYMENT header is required",
			accepts: paymentRequirements,
		});
		return false;
	}

	console.log("🔍 Backend: Received payment header:", payment.substring(0, 100) + "...");

	let decodedPayment: PaymentPayload;
	try {
		decodedPayment = exact.evm.decodePayment(payment);
		decodedPayment.x402Version = x402Version;
		console.log("🔍 Backend: Decoded payment:", {
			from: decodedPayment.payload.authorization.from,
			to: decodedPayment.payload.authorization.to,
			value: decodedPayment.payload.authorization.value,
			validAfter: decodedPayment.payload.authorization.validAfter,
			validBefore: decodedPayment.payload.authorization.validBefore,
			nonce: decodedPayment.payload.authorization.nonce,
			signature: decodedPayment.payload.signature?.substring(0, 20) + "...",
		});
	} catch (error) {
		console.error("❌ Backend: Failed to decode payment:", error);
		res.status(402).json({
			x402Version,
			error: error || "Invalid or malformed payment header",
			accepts: paymentRequirements,
		});
		return false;
	}

	try {
		const selectedPaymentRequirement = findMatchingPaymentRequirements(paymentRequirements, decodedPayment) || paymentRequirements[0];
		console.log("🔍 Backend: Selected payment requirement:", {
			network: selectedPaymentRequirement.network,
			asset: selectedPaymentRequirement.asset,
			extra: selectedPaymentRequirement.extra,
		});
		
		// Debug the verification process
		const chainId = getNetworkId(selectedPaymentRequirement.network);
		const name = selectedPaymentRequirement.extra?.name ?? config[chainId.toString()].usdcName;
		console.log("🔍 Backend: Verification details:", {
			chainId,
			paymentRequirementsName: selectedPaymentRequirement.extra?.name,
			configName: config[chainId.toString()].usdcName,
			finalName: name,
		});
		
		const response = await verify(decodedPayment, selectedPaymentRequirement);
		console.log("🔍 Backend: Verification response:", response);
		
		if (!response.isValid) {
			res.status(402).json({
				x402Version,
				error: response.invalidReason,
				accepts: paymentRequirements,
				payer: response.payer,
			});
			return false;
		}
	} catch (error) {
		console.error("❌ Backend: Verification error:", error);
		res.status(402).json({
			x402Version,
			error,
			accepts: paymentRequirements,
		});
		return false;
	}

	return true;
}

async function main() {
	await initializeDatabase();

	app.get("/", (req, res) => {
		res.send("Hello Novix Pay");
	});
	app.use("/api/accounts", accountRouter);
	app.use("/api/plans", planRouter)
	app.use("/api/payments", paymentRouter)
	app.use("/api/usdc-test", usdcRouter)
	app.use("/facilitator", facilitatorRouter);
	app.use(
		paymentMiddleware(
			payTo,
			{
				"GET /tests": {
					price: "$1.00",
					network: "etherlink-testnet",
				},
			},
			{ url: facilitatorUrl }
		)
	);

	app.get("/tests", (req, res) => {
		res.send({
			report: {
				weather: "sunny",
				temperature: 70,
			},
		});
	});

	app.get("/test-get-payment-reqs", async (req, res) => {
		const price = 1;
		const resource = `${req.protocol}://${req.headers.host}${req.originalUrl}` as Resource;
		const paymentRequirements = [createExactPaymentRequirements(price, "etherlink-testnet", resource, "Access weather data")];

		res.json(paymentRequirements);
	});

	app.get("/test-dynamic-price", async (req, res) => {
		const price = 1;
		const resource = `${req.protocol}://${req.headers.host}${req.originalUrl}` as Resource;

		const paymentRequirements = [createExactPaymentRequirements(price, "etherlink-testnet", resource, "Access weather data")];
		
		console.log("🔍 Backend: Created payment requirements:", paymentRequirements[0]);

		const isValid = await verifyPayment(req, res, paymentRequirements);

		if (!isValid) return;

		try {
			const settleResponse = await settle(exact.evm.decodePayment(req.header("X-PAYMENT")!), paymentRequirements[0]);

			const responseHeader = settleResponseHeader(settleResponse);

			res.setHeader("X-PAYMENT-RESPONSE", responseHeader);

			res.json({
				report: {
					success: "sunny",
					temperature: 60,
				},
			});
		} catch (err) {
			console.log(err);
			res.status(402).json({
				x402Version,
				error: err,
				accepts: paymentRequirements,
			});
		}
	});

	app.get(/(.*)/, (req: express.Request, res: express.Response) => {
		res.status(500).json({ success: false, msg: "Internal Server Error" });
	});

	app.listen(APP_PORT, () => {
		logger.info(`Server started at http://localhost:${APP_PORT}`);
	});
}

main();
