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

	// @ts-expect-error
	const valid = await verify(walletClient, paymentPayload, paymentRequirements);
	console.log("Verification result:", valid);
	console.log("Verification successful with RPC:", rpcUrl);
	return res.json(valid);
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

	const response = await settle(signer as any, paymentPayload, paymentRequirements);
	console.log("Settlement successful with RPC:", rpcUrl);
	return res.json(response);
});

export default facilitatorRouter;
