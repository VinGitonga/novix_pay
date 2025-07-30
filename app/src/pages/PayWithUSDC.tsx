import { SiteHeader } from "@/components/layouts/site-header";
import { useThirdwebStore } from "@/hooks/store/useThirdwebStore";
import { safeClone } from "@/lib/utils";
import { Button } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { createPublicClient, defineChain, formatUnits, http, publicActions, type Hex } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { preparePaymentHeader, selectPaymentRequirements } from "x402";
import { exact } from "x402/schemes";
import { getNetworkId } from "x402/shared";
import { getUSDCBalance } from "x402/shared/evm";
import type { PaymentPayload, PaymentRequirements } from "x402/types";

function ensureValidAmount(paymentRequirements: PaymentRequirements): PaymentRequirements {
	const updatedRequirements = safeClone(paymentRequirements);

	const amountInBaseUnits = Math.round(1 * 1_000_000);
	updatedRequirements.maxAmountRequired = amountInBaseUnits.toString();

	return updatedRequirements;
}

const reqPaymentRequirements = [
	{
		scheme: "exact",
		network: "etherlink-testnet",
		maxAmountRequired: "1000000",
		resource: "http://localhost:8745/test-dynamic-price",
		description: "Access weather data",
		mimeType: "application/json",
		payTo: "0x68EcA16c451C55fC4613a2f982090b65234C8D8a",
		maxTimeoutSeconds: 300, // 5 minutes
		asset: "0xe3A01f57C76B6bdf926618C910E546F794ff6dd4", // USDC on Etherlink testnet
		extra: {
			name: "USD Coin", // Must match the actual USDC contract name on Etherlink testnet
			version: "2",
		},
	},
] satisfies PaymentRequirements[];

const PayWithUSDC = () => {
	const { walletClient } = useThirdwebStore();
	const activeAccount = useActiveAccount();
	const thirdwebwebWallet = useActiveWallet();
	const { isConnected, address } = useAccount();
	const { data: wagmiWalletClient } = useWalletClient();


	console.log("isConnected", isConnected);
	console.log("address", address);

	const [formattedUsdcBalance, setFormattedUsdcBalance] = useState<string>("");

	// Define Etherlink testnet chain with the correct RPC URL
	const etherlinkTestnetChain = defineChain({
		id: 128123,
		name: "Etherlink Testnet",
		nativeCurrency: {
			decimals: 18,
			name: "Tez",
			symbol: "XTZ",
		},
		rpcUrls: {
			default: { 
				http: ["https://rpc.ankr.com/etherlink_testnet/a82544020f1eaac977cf88367f722bd63ecb54ec7d3154933897a56f1038f8ad"] 
			},
		},
		blockExplorers: {
			default: {
				name: "Etherlink Testnet",
				url: "https://testnet.explorer.etherlink.com",
			},
		},
		testnet: true,
	});

	const publicClient = createPublicClient({ 
		chain: etherlinkTestnetChain, 
		transport: http() 
	}).extend(publicActions);
	const paymentRequirements = selectPaymentRequirements(reqPaymentRequirements.flat(), "etherlink-testnet", "exact");

	// useEffect(() => {
	// 	checkUSDCBalance();
	// }, [activeAccount?.address]);

	const checkUSDCBalance = useCallback(async () => {
		if (!activeAccount) return;

		try {
			const balance = await getUSDCBalance(publicClient as any, activeAccount.address as any);
			const formattedBalance = formatUnits(balance, 6); // USDC has 6 decimals
			console.log("USDC Balance:", formattedBalance);
			console.log("USDC Balance in base units:", balance.toString());
			setFormattedUsdcBalance(formattedBalance);
			
			// Check if balance is sufficient for payment
			const requiredAmount = BigInt(paymentRequirements.maxAmountRequired);
			console.log("Required amount:", requiredAmount.toString());
			console.log("Has sufficient balance:", balance >= requiredAmount);
			
			if (balance < requiredAmount) {
				console.error("Insufficient USDC balance for payment");
			}
		} catch (error) {
			console.error("Error checking USDC balance:", error);
		}
	}, [publicClient, activeAccount, paymentRequirements.maxAmountRequired]);

	const checkUSDCContractState = useCallback(async () => {
		if (!activeAccount) return;

		try {
			// Check if the user is blacklisted
			const isBlacklisted = await publicClient.readContract({
				address: paymentRequirements.asset as `0x${string}`,
				abi: [
					{
						inputs: [{ internalType: "address", name: "_account", type: "address" }],
						name: "isBlacklisted",
						outputs: [{ internalType: "bool", name: "", type: "bool" }],
						stateMutability: "view",
						type: "function",
					},
				],
				functionName: "isBlacklisted",
				args: [activeAccount.address as `0x${string}`],
			});
			console.log("Is user blacklisted:", isBlacklisted);

			// Check if the contract is paused
			const isPaused = await publicClient.readContract({
				address: paymentRequirements.asset as `0x${string}`,
				abi: [
					{
						inputs: [],
						name: "paused",
						outputs: [{ internalType: "bool", name: "", type: "bool" }],
						stateMutability: "view",
						type: "function",
					},
				],
				functionName: "paused",
			});
			console.log("Is contract paused:", isPaused);

			if (isBlacklisted) {
				console.error("User is blacklisted on USDC contract");
			}
			if (isPaused) {
				console.error("USDC contract is paused");
			}
		} catch (error) {
			console.error("Error checking USDC contract state:", error);
		}
	}, [publicClient, activeAccount, paymentRequirements.asset]);

	const unSignedPaymentHeader = preparePaymentHeader(address as Hex, 1, paymentRequirements);

	const checkNonceUsage = useCallback(async () => {
		if (!activeAccount) return;

		try {
			// Check if the nonce has already been used
			const nonceUsed = await publicClient.readContract({
				address: paymentRequirements.asset as `0x${string}`,
				abi: [
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
				],
				functionName: "authorizationState",
				args: [
					activeAccount.address as `0x${string}`,
					unSignedPaymentHeader.payload.authorization.nonce as `0x${string}`
				],
			});
			console.log("Is nonce already used:", nonceUsed);
			
			if (nonceUsed) {
				console.error("Nonce has already been used! This will cause the transaction to revert.");
			}
		} catch (error) {
			console.error("Error checking nonce usage:", error);
		}
	}, [publicClient, activeAccount, unSignedPaymentHeader.payload.authorization.nonce, paymentRequirements.asset]);

	const checkUSDCContractInterface = useCallback(async () => {
		if (!activeAccount) return;

		try {
			// Check if the contract supports transferWithAuthorization
			const hasTransferWithAuth = await publicClient.readContract({
				address: paymentRequirements.asset as `0x${string}`,
				abi: [
					{
						inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
						name: "supportsInterface",
						outputs: [{ internalType: "bool", name: "", type: "bool" }],
						stateMutability: "view",
						type: "function",
					},
				],
				functionName: "supportsInterface",
				args: ["0x4d9f3df1" as `0x${string}`], // Interface ID for EIP-3009
			});
			console.log("Contract supports EIP-3009 (transferWithAuthorization):", hasTransferWithAuth);
			
			// Try to get the contract name and version
			try {
				const name = await publicClient.readContract({
					address: paymentRequirements.asset as `0x${string}`,
					abi: [
						{
							inputs: [],
							name: "name",
							outputs: [{ internalType: "string", name: "", type: "string" }],
							stateMutability: "view",
							type: "function",
						},
					],
					functionName: "name",
				});
				console.log("USDC Contract name:", name);
			} catch (e) {
				console.log("Could not get contract name:", e);
			}
			
			// Try to get the contract symbol
			try {
				const symbol = await publicClient.readContract({
					address: paymentRequirements.asset as `0x${string}`,
					abi: [
						{
							inputs: [],
							name: "symbol",
							outputs: [{ internalType: "string", name: "", type: "string" }],
							stateMutability: "view",
							type: "function",
						},
					],
					functionName: "symbol",
				});
				console.log("USDC Contract symbol:", symbol);
			} catch (e) {
				console.log("Could not get contract symbol:", e);
			}
		} catch (error) {
			console.error("Error checking USDC contract interface:", error);
		}
	}, [publicClient, activeAccount, paymentRequirements.asset]);

	const checkTimestampValidity = useCallback(async () => {
		try {
			const currentBlock = await publicClient.getBlock();
			const currentTimestamp = currentBlock.timestamp;
			const validAfter = BigInt(unSignedPaymentHeader.payload.authorization.validAfter);
			const validBefore = BigInt(unSignedPaymentHeader.payload.authorization.validBefore);
			
			console.log("Timestamp analysis:", {
				currentTimestamp: currentTimestamp.toString(),
				validAfter: validAfter.toString(),
				validBefore: validBefore.toString(),
				isValidAfter: currentTimestamp >= validAfter,
				isValidBefore: currentTimestamp <= validBefore,
				timeUntilValid: validAfter > currentTimestamp ? (validAfter - currentTimestamp).toString() : "0",
				timeUntilExpires: validBefore > currentTimestamp ? (validBefore - currentTimestamp).toString() : "0",
			});
			
			if (currentTimestamp < validAfter) {
				console.error("Authorization is not yet valid! Wait", (validAfter - currentTimestamp).toString(), "seconds");
			}
			
			if (currentTimestamp > validBefore) {
				console.error("Authorization has expired!");
			}
			
			return {
				currentTimestamp,
				validAfter,
				validBefore,
				isValid: currentTimestamp >= validAfter && currentTimestamp <= validBefore,
			};
		} catch (error) {
			console.error("Error checking timestamp validity:", error);
			throw error;
		}
	}, [publicClient, unSignedPaymentHeader.payload.authorization.validAfter, unSignedPaymentHeader.payload.authorization.validBefore]);

	useEffect(() => {
		if (activeAccount?.address) {
			checkUSDCBalance();
			checkUSDCContractState();
			checkNonceUsage();
			checkUSDCContractInterface();
			checkTimestampValidity();
		}
	}, [activeAccount?.address, checkUSDCBalance, checkUSDCContractState, checkNonceUsage, checkUSDCContractInterface, checkTimestampValidity]);

	const onPressPay = async () => {
		const testWalletClient = wagmiWalletClient?.extend(publicActions);
		try {
			const validPaymentRequirements = ensureValidAmount(paymentRequirements);
			const initialPayment = await exact.evm.createPayment(testWalletClient as any, 1, validPaymentRequirements);
			const paymentHeader: string = exact.evm.encodePayment(initialPayment);

			const response = await fetch("http://localhost:8745/test-dynamic-price", {
				headers: {
					"X-PAYMENT": paymentHeader,
					"Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
				},
			});

			console.log(response);

			// const resp = await paymentApi.testDynamicPayment(walletClient!);

			// console.log("rssp", resp);
		} catch (err) {
			console.log("Erroror", err);
		}
	};

	const onPressPay2 = async () => {
		try {
			// First, verify the payment is valid before signing
			console.log("🔍 Pre-payment validation:");
			await checkUSDCBalance();
			await checkUSDCContractState();
			await checkNonceUsage();
			await checkUSDCContractInterface();
			await checkTimestampValidity();

			console.log("✍️ Signing payment authorization...");
			
			// Use the proper x402 library function instead of manual EIP-712 construction
			const testWalletClient = wagmiWalletClient?.extend(publicActions);
			const validPaymentRequirements = ensureValidAmount(paymentRequirements);
			const paymentPayload = await exact.evm.createPayment(testWalletClient as any, 1, validPaymentRequirements);

			// Debug: Log the authorization parameters
			console.log("📋 Authorization parameters:", {
				from: paymentPayload.payload.authorization.from,
				to: paymentPayload.payload.authorization.to,
				value: paymentPayload.payload.authorization.value,
				validAfter: paymentPayload.payload.authorization.validAfter,
				validBefore: paymentPayload.payload.authorization.validBefore,
				nonce: paymentPayload.payload.authorization.nonce,
				signature: paymentPayload.payload.signature,
			});

			const payment: string = exact.evm.encodePayment(paymentPayload);

			console.log("🚀 Sending payment request with header:", payment);

			const response = await fetch("http://localhost:8745/test-dynamic-price", {
				headers: {
					"X-PAYMENT": payment,
					"Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
				},
				method: "GET",
			});

			console.log("📡 Response status:", response.status);
			console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

			if (!response.ok) {
				const errorText = await response.text();
				console.error("❌ Response error:", errorText);
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}

			const responseData = await response.text();
			console.log("✅ Response data:", responseData);
			
			// Check for X-PAYMENT-RESPONSE header
			const paymentResponse = response.headers.get("X-PAYMENT-RESPONSE");
			if (paymentResponse) {
				console.log("💰 Payment response:", paymentResponse);
			}
		} catch (err) {
			console.error("❌ Payment error details:", err);
			if (err instanceof Error) {
				console.error("Error name:", err.name);
				console.error("Error message:", err.message);
				console.error("Error stack:", err.stack);
			}
		}
	};

	const simulateTransferWithAuthorization = useCallback(async () => {
		if (!activeAccount) return;

		try {
			// Use the proper x402 library function instead of manual EIP-712 construction
			const testWalletClient = wagmiWalletClient?.extend(publicActions);
			const validPaymentRequirements = ensureValidAmount(paymentRequirements);
			const paymentPayload = await exact.evm.createPayment(testWalletClient as any, 1, validPaymentRequirements);
			
			// Simulate the transferWithAuthorization call
			const result = await publicClient.simulateContract({
				address: paymentRequirements.asset as `0x${string}`,
				abi: [
					{
						inputs: [
							{ internalType: "address", name: "from", type: "address" },
							{ internalType: "address", name: "to", type: "address" },
							{ internalType: "uint256", name: "value", type: "uint256" },
							{ internalType: "uint256", name: "validAfter", type: "uint256" },
							{ internalType: "uint256", name: "validBefore", type: "uint256" },
							{ internalType: "bytes32", name: "nonce", type: "bytes32" },
							{ internalType: "bytes", name: "signature", type: "bytes" },
						],
						name: "transferWithAuthorization",
						outputs: [],
						stateMutability: "nonpayable",
						type: "function",
					},
				],
				functionName: "transferWithAuthorization",
				args: [
					paymentPayload.payload.authorization.from as `0x${string}`,
					paymentPayload.payload.authorization.to as `0x${string}`,
					BigInt(paymentPayload.payload.authorization.value),
					BigInt(paymentPayload.payload.authorization.validAfter),
					BigInt(paymentPayload.payload.authorization.validBefore),
					paymentPayload.payload.authorization.nonce as `0x${string}`,
					paymentPayload.payload.signature as `0x${string}`,
				],
				account: activeAccount.address as `0x${string}`,
			});
			
			console.log("Simulation successful:", result);
			return true;
		} catch (error) {
			console.error("Simulation failed:", error);
			return false;
		}
	}, [activeAccount, wagmiWalletClient, publicClient, paymentRequirements, publicActions]);

	const testTransferWithAuthorization = useCallback(async () => {
		if (!activeAccount) return;

		try {
			// Use the proper x402 library function instead of manual EIP-712 construction
			const testWalletClient = wagmiWalletClient?.extend(publicActions);
			const validPaymentRequirements = ensureValidAmount(paymentRequirements);
			const paymentPayload = await exact.evm.createPayment(testWalletClient as any, 1, validPaymentRequirements);
			
			console.log("Testing transferWithAuthorization with parameters:");
			console.log({
				from: paymentPayload.payload.authorization.from,
				to: paymentPayload.payload.authorization.to,
				value: paymentPayload.payload.authorization.value,
				validAfter: paymentPayload.payload.authorization.validAfter,
				validBefore: paymentPayload.payload.authorization.validBefore,
				nonce: paymentPayload.payload.authorization.nonce,
				signature: paymentPayload.payload.signature,
			});

			// Try to call transferWithAuthorization directly to get detailed error
			const result = await publicClient.simulateContract({
				address: paymentRequirements.asset as `0x${string}`,
				abi: [
					{
						inputs: [
							{ internalType: "address", name: "from", type: "address" },
							{ internalType: "address", name: "to", type: "address" },
							{ internalType: "uint256", name: "value", type: "uint256" },
							{ internalType: "uint256", name: "validAfter", type: "uint256" },
							{ internalType: "uint256", name: "validBefore", type: "uint256" },
							{ internalType: "bytes32", name: "nonce", type: "bytes32" },
							{ internalType: "bytes", name: "signature", type: "bytes" },
						],
						name: "transferWithAuthorization",
						outputs: [],
						stateMutability: "nonpayable",
						type: "function",
					},
				],
				functionName: "transferWithAuthorization",
				args: [
					paymentPayload.payload.authorization.from as `0x${string}`,
					paymentPayload.payload.authorization.to as `0x${string}`,
					BigInt(paymentPayload.payload.authorization.value),
					BigInt(paymentPayload.payload.authorization.validAfter),
					BigInt(paymentPayload.payload.authorization.validBefore),
					paymentPayload.payload.authorization.nonce as `0x${string}`,
					paymentPayload.payload.signature as `0x${string}`,
				],
				account: activeAccount.address as `0x${string}`,
			});
			
			console.log("TransferWithAuthorization simulation successful:", result);
			return result;
		} catch (error) {
			console.error("TransferWithAuthorization simulation failed:", error);
			
			// Try to extract more detailed error information
			if (error instanceof Error) {
				console.error("Error details:", {
					message: error.message,
					name: error.name,
					stack: error.stack,
				});
			}
			
			throw error;
		}
	}, [activeAccount, wagmiWalletClient, publicClient, paymentRequirements, publicActions]);

	const verifySignature = useCallback(async () => {
		if (!activeAccount) return;

		try {
			// Use the proper x402 library function instead of manual EIP-712 construction
			const testWalletClient = wagmiWalletClient?.extend(publicActions);
			const validPaymentRequirements = ensureValidAmount(paymentRequirements);
			const paymentPayload = await exact.evm.createPayment(testWalletClient as any, 1, validPaymentRequirements);
			
			console.log("Signature analysis:", {
				signature: paymentPayload.payload.signature,
				signatureLength: paymentPayload.payload.signature.length,
				fromAddress: paymentPayload.payload.authorization.from,
				toAddress: paymentPayload.payload.authorization.to,
				value: paymentPayload.payload.authorization.value,
				validAfter: paymentPayload.payload.authorization.validAfter,
				validBefore: paymentPayload.payload.authorization.validBefore,
				nonce: paymentPayload.payload.authorization.nonce,
			});

			// Verify the signature format
			if (!paymentPayload.payload.signature.startsWith("0x")) {
				console.error("❌ Signature does not start with 0x");
			}

			if (paymentPayload.payload.signature.length !== 132) {
				console.error("❌ Signature length is not 132 characters (65 bytes)");
			}

			console.log("✅ Signature format appears valid");
		} catch (error) {
			console.error("Error verifying signature:", error);
			throw error;
		}
	}, [activeAccount, wagmiWalletClient, paymentRequirements, publicActions]);
	return (
		<>
			<SiteHeader title="Payments" />
			<div className="mt-5 px-5">
				<Button onPress={onPressPay2}>Pay</Button>
				<Button onPress={checkUSDCBalance}>Check USDC Balance</Button>
				<Button onPress={checkUSDCContractState}>Check USDC Contract State</Button>
				<Button onPress={checkNonceUsage}>Check Nonce Usage</Button>
				<Button onPress={checkUSDCContractInterface}>Check Contract Interface</Button>
				<Button onPress={checkTimestampValidity}>Check Timestamps</Button>
				<Button onPress={simulateTransferWithAuthorization}>Simulate Transfer</Button>
				<Button onPress={testTransferWithAuthorization}>Test TransferWithAuth</Button>
				<Button onPress={verifySignature}>Verify Signature</Button>
				{formattedUsdcBalance && (
					<div className="mt-4 p-4 bg-gray-100 rounded">
						<p>USDC Balance: {formattedUsdcBalance}</p>
					</div>
				)}
			</div>
		</>
	);
};

export default PayWithUSDC;
