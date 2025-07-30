import { API_BASE_URL } from "@/constants";
import axios, { type AxiosInstance } from "axios";
import type { WalletClient } from "viem";
import { withPaymentInterceptor } from "x402-axios";

const baseApiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

let apiClient: AxiosInstance = baseApiClient;

export function updateApiClient(walletClient: WalletClient | null) {
	if (walletClient && walletClient.account) {
		apiClient = withPaymentInterceptor(baseApiClient, walletClient as any);
	} else {
		// No wallet connected - reset to base client
		apiClient = baseApiClient;
		console.log("⚠️ API client reset - no wallet connected");
	}
}

export const paymentApi = {
	testDynamicPayment: async (walletClient: WalletClient) => {
		const client = withPaymentInterceptor(baseApiClient, walletClient as any)
		const response = await client.get("/test-dynamic-price");

		return response.data;
	},
};
