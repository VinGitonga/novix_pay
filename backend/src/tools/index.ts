import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { z } from "zod";
import { CLIENT_URL } from "src/constants";

export const makePaymentTool = tool(
	async ({ wallet_address, amount }, config: RunnableConfig) => {
		let userTelegramId = config["configurable"]["user_id"];
		let username = config["configurable"]["username"];

		if (!wallet_address) {
			return `Kindly provide the wallet address for the person being paid`;
		}

		if (!amount || amount <= 0) {
			return `Amount to pay them has to be greater than 0`;
		}

		return `Payment link generated successfully. Please click on this link: ${CLIENT_URL}/instant/payments?account=${wallet_address}&amt=${amount}`;
	},
	{
		name: "makePayment",
		description: "This tool assist users to generate the payment link to a wallet address directly",
		schema: z.object({
			wallet_address: z.string().describe("This is the wallet address for the account to be paid instantly"),
			amount: z.number().describe("Amount in USDC for the target wallet address to be paid"),
		}),
	}
);
