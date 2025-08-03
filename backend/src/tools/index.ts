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

		return `Payment link generated successfully. Please click on this link: ${CLIENT_URL}/instant/payments?account=${wallet_address}&amt=${amount}&u=${username}&tg_id=${userTelegramId}`;
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

export const setupRecurringPayment = tool(
	async ({ wallet_address, amount, dueDate, recurring, frequency, description }, config: RunnableConfig) => {
		let userTelegramId = config["configurable"]["user_id"];
		let username = config["configurable"]["username"];

		if (!wallet_address) {
			return `Kindly provide the wallet address for the person being paid`;
		}

		if (!amount || amount <= 0) {
			return `Amount to pay them has to be greater than 0`;
		}

		if (!dueDate) {
			return `Please provide a due date for the payment`;
		}

		if (!frequency) {
			return `Provide how frequent the payment should run`;
		}

		return `Recurremt Payments link generated successfully. Please click on this link: ${CLIENT_URL}/recurring-payment-checkout?wallet=${wallet_address}&amount=${amount}&dueDate=${dueDate}&recurring=${recurring}&frequency=${frequency}&description=${
			description ?? ""
		}&u=${username}&tg_id=${userTelegramId}`;
	},
	{
		name: "setupRecurringPayments",
		description: "A tool to be utilized to assist users setup recurring payments on their behalf. It generates a link that users click and redirected to a UI where they sign the transaction.",
		schema: z.object({
			wallet_address: z.string().describe("Wallet address to the provider or account to be paid in intervals"),
			amount: z.number().describe("Amount in USDC to paid to the provider in recurrent"),
			dueDate: z.string().describe("Due Date in future for when the payment should be made. It should be in ISO format. e.g. 2025-08-03T14.20"),
			recurring: z.boolean().describe("Whether is should be reccuring or not"),
			frequency: z.string().describe("How frequent the payment should be made. It should be either : 'weekly' or 'monthly' or 'yearly'"),
			description: z.string().optional().describe("Reason or the topic of the recurrent payment. e.g. Monthly spotify subscription payment"),
		}),
	}
);
