import { createPublicClient, createWalletClient, defineChain, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { WALLET_PRIVATE_KEY } from "./constants";
import { exact } from "x402/schemes";
import { PaymentRequirements } from "x402/types";

const PRIVATE_KEY = `0x${WALLET_PRIVATE_KEY}`;

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

const publicClient = createPublicClient({
	chain: testnetChain,
	transport: http(rpcUrl),
}).extend(publicActions);

// Test payment requirements
const testPaymentRequirements: PaymentRequirements = {
	scheme: "exact",
	network: "etherlink-testnet",
	maxAmountRequired: "1000000", // 1 USDC
	resource: "http://localhost:8745/test-dynamic-price",
	description: "Test payment with fresh timestamps",
	mimeType: "application/json",
	payTo: "0x68EcA16c451C55fC4613a2f982090b65234C8D8a",
	maxTimeoutSeconds: 300, // 5 minutes
	asset: "0xe3A01f57C76B6bdf926618C910E546F794ff6dd4", // USDC on Etherlink testnet
	extra: {
		name: "USD Coin",
		version: "2",
	},
};

async function testFreshPayment() {
	console.log("🧪 Testing payment with fresh timestamps...\n");

	try {
		// Get current timestamp
		const currentBlock = await publicClient.getBlock();
		const currentTimestamp = currentBlock.timestamp;
		console.log(`📅 Current block timestamp: ${currentTimestamp}`);

		// Create a fresh payment header
		console.log("\n📝 Creating fresh payment header...");
		const unsignedPaymentHeader = exact.evm.preparePaymentHeader(await signer.account.address, 1, testPaymentRequirements);

		console.log("Payment header created:", {
			from: unsignedPaymentHeader.payload.authorization.from,
			to: unsignedPaymentHeader.payload.authorization.to,
			value: unsignedPaymentHeader.payload.authorization.value,
			validAfter: unsignedPaymentHeader.payload.authorization.validAfter,
			validBefore: unsignedPaymentHeader.payload.authorization.validBefore,
			nonce: unsignedPaymentHeader.payload.authorization.nonce,
		});

		// Validate timestamps
		const validAfter = BigInt(unsignedPaymentHeader.payload.authorization.validAfter);
		const validBefore = BigInt(unsignedPaymentHeader.payload.authorization.validBefore);

		console.log("\n⏰ Timestamp validation:");
		console.log(`   Current: ${currentTimestamp}`);
		console.log(`   Valid After: ${validAfter}`);
		console.log(`   Valid Before: ${validBefore}`);
		console.log(`   Is Valid After: ${currentTimestamp >= validAfter}`);
		console.log(`   Is Valid Before: ${currentTimestamp <= validBefore}`);
		console.log(`   Is Currently Valid: ${currentTimestamp >= validAfter && currentTimestamp <= validBefore}`);

		if (currentTimestamp < validAfter) {
			console.log("   ⚠️  Authorization is not yet valid");
		} else if (currentTimestamp > validBefore) {
			console.log("   ❌ Authorization has expired");
		} else {
			console.log("   ✅ Authorization is currently valid");
		}

		// Sign the payment header
		console.log("\n✍️  Signing payment header...");
		const signedPaymentHeader = await exact.evm.signPaymentHeader(signer as any, testPaymentRequirements, unsignedPaymentHeader);

		console.log("Payment header signed successfully!");

		// Test the payment by calling the facilitator
		console.log("\n🚀 Testing payment with facilitator...");

		const response = await fetch("http://localhost:6099/verify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				paymentPayload: signedPaymentHeader,
				paymentRequirements: testPaymentRequirements,
			}),
		});

		const result = await response.json();
		console.log("Facilitator verification result:", result);

		if (response.ok && result.isValid) {
			console.log("✅ Payment verification successful!");

			// Test settlement
			console.log("\n💰 Testing payment settlement...");
			const settleResponse = await fetch("http://localhost:6099/settle", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					paymentPayload: signedPaymentHeader,
					paymentRequirements: testPaymentRequirements,
				}),
			});

			const settleResult = await settleResponse.json();
			console.log("Facilitator settlement result:", settleResult);

			if (settleResponse.ok && settleResult.success) {
				console.log("✅ Payment settlement successful!");
				console.log(`Transaction hash: ${settleResult.transaction}`);
			} else {
				console.log("❌ Payment settlement failed:", settleResult);
			}
		} else {
			console.log("❌ Payment verification failed:", result);
		}
	} catch (error) {
		console.error("❌ Error during test:", error);
	}
}

// Run the test
testFreshPayment().catch(console.error);
