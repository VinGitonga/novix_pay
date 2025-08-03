import { createPublicClient, createWalletClient, http } from "viem";
import { etherlinkTestnetChain } from "./utils";
import { privateKeyToAccount } from "viem/accounts";
import { API_BASE_URL, WALLET_PRIVATE_KEY } from "./constants";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";

const account = privateKeyToAccount(`0x${WALLET_PRIVATE_KEY}`);
const walletClient = createWalletClient({ account, chain: etherlinkTestnetChain, transport: http() });

const axiosInstance = axios.create({ baseURL: API_BASE_URL });

const api = withPaymentInterceptor(axiosInstance as any, walletClient.account as any);

async function testRun() {
	try {
		const resp = await api.get("/payments/pay-document?docId=Qyqk09Hc");

		console.log("resp", resp.data);
	} catch (err) {
		console.log("errorr", err);
	}
}
