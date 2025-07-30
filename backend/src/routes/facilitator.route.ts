import { Router } from "express";
import { WALLET_PRIVATE_KEY } from "src/constants";
import { createPublicClient, createWalletClient, defineChain, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { PaymentPayload, PaymentPayloadSchema, PaymentRequirements, PaymentRequirementsSchema } from "x402/types";
import { settle, verify } from "x402/facilitator";

const PRIVATE_KEY = `0x${WALLET_PRIVATE_KEY}`;

const facilitatorRouter = Router();

type VerifyRequest = {
	paymentPayload: PaymentPayload;
	paymentRequirements: PaymentRequirements;
};

type SettleRequest = {
	paymentPayload: PaymentPayload;
	paymentRequirements: PaymentRequirements;
};

const rpcUrl = "https://rpc.ankr.com/etherlink_testnet/a82544020f1eaac977cf88367f722bd63ecb54ec7d3154933897a56f1038f8ad";

const testnetChain = defineChain({
	id: 128123,
	name: "Etherlink Testnet",
	nativeCurrency: {
		decimals: 18,
		name: "Tez",
		symbol: "XTZ",
	},
	rpcUrls: {
		default: { http: [rpcUrl] },
	},
	blockExplorers: {
		default: {
			name: "Etherlink Testnet",
			url: "https://testnet.explorer.etherlink.com",
		},
	},
	testnet: true,
});

const signer = createWalletClient({
	chain: testnetChain,
	transport: http(rpcUrl),
	account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
}).extend(publicActions);

const walletClient = createPublicClient({
	chain: testnetChain,
	transport: http(rpcUrl),
}).extend(publicActions);

// Helper function to validate authorization timestamps
function validateAuthorizationTimestamps(paymentPayload: PaymentPayload) {
	const currentTime = Math.floor(Date.now() / 1000);
	const validAfter = BigInt(paymentPayload.payload.authorization.validAfter);
	const validBefore = BigInt(paymentPayload.payload.authorization.validBefore);

	console.log("Timestamp validation:", {
		currentTime,
		validAfter: validAfter.toString(),
		validBefore: validBefore.toString(),
		isValidAfter: currentTime >= validAfter,
		isValidBefore: currentTime <= validBefore,
	});

	if (currentTime < validAfter) {
		return {
			isValid: false,
			reason: "Authorization is not yet valid",
			details: {
				currentTime,
				validAfter: validAfter.toString(),
				timeUntilValid: (validAfter - BigInt(currentTime)).toString(),
			},
		};
	}

	if (currentTime > validBefore) {
		return {
			isValid: false,
			reason: "Authorization has expired",
			details: {
				currentTime,
				validBefore: validBefore.toString(),
				timeSinceExpired: (BigInt(currentTime) - validBefore).toString(),
			},
		};
	}

	return { isValid: true };
}

facilitatorRouter.get("/verify", (req, res) => {
	res.json({
		endpoint: "/verify",
		description: "POST to verify x402 payments",
		body: {
			paymentPayload: "PaymentPayload",
			paymentRequirements: "PaymentRequirements",
		},
	});
});

facilitatorRouter.post("/verify", async (req, res) => {
	const body: VerifyRequest = req.body;
	console.log("Received verification request:", {
		paymentPayload: body.paymentPayload,
		paymentRequirements: body.paymentRequirements,
	});

	try {
		const paymentRequirements = PaymentRequirementsSchema.parse(body.paymentRequirements);
		const paymentPayload = PaymentPayloadSchema.parse(body.paymentPayload);

		console.log("Parsed verification request:", {
			from: paymentPayload.payload.authorization.from,
			to: paymentPayload.payload.authorization.to,
			value: paymentPayload.payload.authorization.value,
			validAfter: paymentPayload.payload.authorization.validAfter,
			validBefore: paymentPayload.payload.authorization.validBefore,
			nonce: paymentPayload.payload.authorization.nonce,
			signature: paymentPayload.payload.signature,
		});

		// Validate timestamps before calling verify
		const timestampValidation = validateAuthorizationTimestamps(paymentPayload);
		if (!timestampValidation.isValid) {
			console.log("Timestamp validation failed:", timestampValidation);
			return res.status(400).json({
				isValid: false,
				invalidReason: timestampValidation.reason,
				details: timestampValidation.details,
				payer: paymentPayload.payload.authorization.from,
			});
		}

		// @ts-expect-error
		const valid = await verify(walletClient, paymentPayload, paymentRequirements);
		console.log("Verification result:", valid);
		console.log("Verification successful with RPC:", rpcUrl);
		return res.json(valid);
	} catch (error) {
		console.error("Verification error:", error);
		return res.status(500).json({
			isValid: false,
			invalidReason: "verification_error",
			error: error instanceof Error ? error.message : "Unknown error",
			payer: body.paymentPayload?.payload?.authorization?.from || "unknown",
		});
	}
});

facilitatorRouter.get("/settle", (req, res) => {
	res.json({
		endpoint: "/settle",
		description: "POST to settle x402 payments",
		body: {
			paymentPayload: "PaymentPayload",
			paymentRequirements: "PaymentRequirements",
		},
	});
});

facilitatorRouter.get("/supported", (req, res) => {
	res.json({
		kinds: [
			{
				x402Version: 1,
				scheme: "exact",
				network: "etherlink-testnet",
			},
		],
	});
});

facilitatorRouter.post("/settle", async (req, res) => {
	const body: SettleRequest = req.body;
	console.log("Received settlement request:", {
		paymentPayload: body.paymentPayload,
		paymentRequirements: body.paymentRequirements,
	});

	try {
		const paymentRequirements = PaymentRequirementsSchema.parse(body.paymentRequirements);
		const paymentPayload = PaymentPayloadSchema.parse(body.paymentPayload);

		console.log("Parsed settlement request:", {
			from: paymentPayload.payload.authorization.from,
			to: paymentPayload.payload.authorization.to,
			value: paymentPayload.payload.authorization.value,
			validAfter: paymentPayload.payload.authorization.validAfter,
			validBefore: paymentPayload.payload.authorization.validBefore,
			nonce: paymentPayload.payload.authorization.nonce,
			signature: paymentPayload.payload.signature,
		});

		// Validate timestamps before calling settle
		const timestampValidation = validateAuthorizationTimestamps(paymentPayload);
		if (!timestampValidation.isValid) {
			console.log("Timestamp validation failed:", timestampValidation);
			return res.status(400).json({
				success: false,
				errorReason: timestampValidation.reason,
				details: timestampValidation.details,
				transaction: "",
				network: paymentPayload.network,
				payer: paymentPayload.payload.authorization.from,
			});
		}

		const response = await settle(signer as any, paymentPayload, paymentRequirements);
		console.log("Settlement successful with RPC:", rpcUrl);
		return res.json(response);
	} catch (error) {
		console.error("Settlement error:", error);
		return res.status(500).json({
			success: false,
			errorReason: "settlement_error",
			error: error instanceof Error ? error.message : "Unknown error",
			transaction: "",
			network: body.paymentPayload?.network || "unknown",
			payer: body.paymentPayload?.payload?.authorization?.from || "unknown",
		});
	}
});

export default facilitatorRouter;
