import { createPublicClient, createWalletClient, defineChain, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { WALLET_PRIVATE_KEY } from "./constants";

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

// USDC contract address on Etherlink testnet
const USDC_ADDRESS = "0xe3A01f57C76B6bdf926618C910E546F794ff6dd4";

// USDC ABI for the functions we need to check
const usdcABI = [
	{
		inputs: [{ internalType: "address", name: "account", type: "address" }],
		name: "balanceOf",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "authorizer", type: "address" },
			{ internalType: "bytes32", name: "nonce", type: "bytes32" }
		],
		name: "authorizationState",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "paused",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "_account", type: "address" }],
		name: "isBlacklisted",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "name",
		outputs: [{ internalType: "string", name: "", type: "string" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "symbol",
		outputs: [{ internalType: "string", name: "", type: "string" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "decimals",
		outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

async function diagnoseTransferIssue() {
	console.log("🔍 Diagnosing transferWithAuthorization issue...\n");

	try {
		// Get current block timestamp
		const currentBlock = await publicClient.getBlock();
		const currentTimestamp = currentBlock.timestamp;
		console.log(`📅 Current block timestamp: ${currentTimestamp}`);

		// Check USDC contract basic info
		console.log("\n📋 USDC Contract Information:");
		try {
			const name = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "name",
			});
			console.log(`   Name: ${name}`);
		} catch (e) {
			console.log(`   Name: Error - ${e}`);
		}

		try {
			const symbol = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "symbol",
			});
			console.log(`   Symbol: ${symbol}`);
		} catch (e) {
			console.log(`   Symbol: Error - ${e}`);
		}

		try {
			const decimals = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "decimals",
			});
			console.log(`   Decimals: ${decimals}`);
		} catch (e) {
			console.log(`   Decimals: Error - ${e}`);
		}

		// Check if contract is paused
		console.log("\n⏸️  Contract State:");
		try {
			const isPaused = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "paused",
			});
			console.log(`   Paused: ${isPaused}`);
			if (isPaused) {
				console.log("   ❌ Contract is paused! This will cause all transfers to revert.");
			}
		} catch (e) {
			console.log(`   Paused check failed: ${e}`);
		}

		// Check facilitator wallet balance
		const facilitatorAddress = await signer.account.address;
		console.log(`\n💰 Facilitator Wallet (${facilitatorAddress}):`);
		
		try {
			const balance = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "balanceOf",
				args: [facilitatorAddress],
			});
			console.log(`   USDC Balance: ${balance} (${Number(balance) / 1e6} USDC)`);
		} catch (e) {
			console.log(`   USDC Balance check failed: ${e}`);
		}

		// Check if facilitator is blacklisted
		try {
			const isBlacklisted = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "isBlacklisted",
				args: [facilitatorAddress],
			});
			console.log(`   Blacklisted: ${isBlacklisted}`);
			if (isBlacklisted) {
				console.log("   ❌ Facilitator wallet is blacklisted!");
			}
		} catch (e) {
			console.log(`   Blacklist check failed: ${e}`);
		}

		// Parse the transaction data from the error
		const txData = "0xcf09299500000000000000000000000041a9dc633fafd6cfa50107ed7040a1c39b5e131900000000000000000000000068eca16c451c55fc4613a2f982090b65234c8d8a00000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000688978d200000000000000000000000000000000000000000000000000000000068897c5697a98b4df30b2ac398269dc1dbabfc94e45a6d87bd6ed316bfb81c3bcb79339b000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000004174b4066884d83b8eece6995065c727619679d49949cf01f56c5879bd50670d00054ae8c887f517b28ecd669a9473dbdcb25e7b56f6176e729d97061f42d640711b00000000000000000000000000000000000000000000000000000000000000";

		console.log("\n📊 Transaction Analysis:");
		console.log(`   Function: transferWithAuthorization`);
		console.log(`   From: 0x41a9dc633faFd6cfA50107eD7040a1c39b5e1319`);
		console.log(`   To: 0x68eca16c451c55fc4613a2f982090b65234c8d8a`);
		console.log(`   Value: 1000000 (1 USDC)`);
		console.log(`   ValidAfter: 1753839826`);
		console.log(`   ValidBefore: 1753840726`);
		console.log(`   Nonce: 0x97a98b4df30b2ac398269dc1dbabfc94e45a6d87bd6ed316bfb81c3bcb79339b`);

		// Check if the nonce has been used
		console.log("\n🔐 Authorization Validation:");
		const nonce = "0x97a98b4df30b2ac398269dc1dbabfc94e45a6d87bd6ed316bfb81c3bcb79339b";
		const senderAddress = "0x41a9dc633faFd6cfA50107eD7040a1c39b5e1319";
		try {
			const nonceUsed = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "authorizationState",
				args: [senderAddress as `0x${string}`, nonce as `0x${string}`],
			});
			console.log(`   Nonce used: ${nonceUsed}`);
			if (nonceUsed) {
				console.log("   ❌ Nonce has already been used! This will cause the transaction to revert.");
			}
		} catch (e) {
			console.log(`   Nonce check failed: ${e}`);
		}

		// Check timestamp validity
		const validAfter = BigInt("1753839826");
		const validBefore = BigInt("1753840726");
		console.log(`\n⏰ Timestamp Analysis:`);
		console.log(`   Current: ${currentTimestamp}`);
		console.log(`   Valid After: ${validAfter}`);
		console.log(`   Valid Before: ${validBefore}`);
		console.log(`   Is Valid After: ${currentTimestamp >= validAfter}`);
		console.log(`   Is Valid Before: ${currentTimestamp <= validBefore}`);
		console.log(`   Is Currently Valid: ${currentTimestamp >= validAfter && currentTimestamp <= validBefore}`);

		if (currentTimestamp < validAfter) {
			console.log("   ❌ Authorization is not yet valid!");
		}
		if (currentTimestamp > validBefore) {
			console.log("   ❌ Authorization has expired!");
		}

		// Check sender balance
		console.log(`\n💳 Sender Wallet (${senderAddress}):`);
		
		try {
			const senderBalance = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "balanceOf",
				args: [senderAddress],
			});
			console.log(`   USDC Balance: ${senderBalance} (${Number(senderBalance) / 1e6} USDC)`);
			const requiredAmount = BigInt("1000000");
			console.log(`   Required Amount: ${requiredAmount} (1 USDC)`);
			console.log(`   Has Sufficient Balance: ${senderBalance >= requiredAmount}`);
			
			if (senderBalance < requiredAmount) {
				console.log("   ❌ Insufficient USDC balance!");
			}
		} catch (e) {
			console.log(`   Sender balance check failed: ${e}`);
		}

		// Check if sender is blacklisted
		try {
			const senderBlacklisted = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "isBlacklisted",
				args: [senderAddress],
			});
			console.log(`   Blacklisted: ${senderBlacklisted}`);
			if (senderBlacklisted) {
				console.log("   ❌ Sender wallet is blacklisted!");
			}
		} catch (e) {
			console.log(`   Sender blacklist check failed: ${e}`);
		}

		// Check if recipient is blacklisted
		const recipientAddress = "0x68eca16c451c55fc4613a2f982090b65234c8d8a";
		console.log(`\n🎯 Recipient Wallet (${recipientAddress}):`);
		
		try {
			const recipientBlacklisted = await publicClient.readContract({
				address: USDC_ADDRESS,
				abi: usdcABI,
				functionName: "isBlacklisted",
				args: [recipientAddress],
			});
			console.log(`   Blacklisted: ${recipientBlacklisted}`);
			if (recipientBlacklisted) {
				console.log("   ❌ Recipient wallet is blacklisted!");
			}
		} catch (e) {
			console.log(`   Recipient blacklist check failed: ${e}`);
		}

		console.log("\n✅ Diagnosis complete!");

	} catch (error) {
		console.error("❌ Error during diagnosis:", error);
	}
}

// Run the diagnosis
diagnoseTransferIssue().catch(console.error); 