import { defineChain } from "viem";

export const etherlinkTestnetChain = defineChain({
	id: 128123,
	name: "Etherlink Testnet",
	nativeCurrency: {
		decimals: 18,
		name: "Tez",
		symbol: "XTZ",
	},
	rpcUrls: {
		default: {
			http: ["https://rpc.ankr.com/etherlink_testnet/a82544020f1eaac977cf88367f722bd63ecb54ec7d3154933897a56f1038f8ad"],
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
