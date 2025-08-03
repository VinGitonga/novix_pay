import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { z } from "zod";
import { CLIENT_URL, API_BASE_URL } from "src/constants";

export const makePaymentTool = tool(
	async ({ wallet_address, amount }, config: RunnableConfig) => {
		let userTelegramId = config["configurable"]["user_id"];
		let username = config["configurable"]["username"];

		if (!wallet_address) {
			return `❌ *Error:* Kindly provide the wallet address for the person being paid`;
		}

		if (!amount || amount <= 0) {
			return `❌ *Error:* Amount to pay them has to be greater than 0`;
		}

		const paymentUrl = `${CLIENT_URL}/instant/payments?account=${wallet_address}&amt=${amount}&u=${username}&tg_id=${userTelegramId}`;

		return `*💳 Instant Payment Link Generated*\n\n✅ *Status:* Payment link created successfully\n\n*Details:*\n• *Recipient:* \`${wallet_address}\`\n• *Amount:* ${amount} USDC\n\n🔗 *Payment Link:*\n[Click here to complete payment](${paymentUrl})\n\n⚠️ *Note:* Click the link above to proceed with the payment transaction\\.`;
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
			return `❌ *Error:* Kindly provide the wallet address for the person being paid`;
		}

		if (!amount || amount <= 0) {
			return `❌ *Error:* Amount to pay them has to be greater than 0`;
		}

		if (!dueDate) {
			return `❌ *Error:* Please provide a due date for the payment`;
		}

		if (!frequency) {
			return `❌ *Error:* Provide how frequent the payment should run`;
		}

		const recurringUrl = `${CLIENT_URL}/recurring-payment-checkout?wallet=${wallet_address}&amount=${amount}&dueDate=${dueDate}&recurring=${recurring}&frequency=${frequency}&description=${
			description ?? ""
		}&u=${username}&tg_id=${userTelegramId}`;

		const formattedDueDate = new Date(dueDate).toLocaleDateString();
		const frequencyEmoji = frequency === "weekly" ? "📅" : frequency === "monthly" ? "📆" : "📊";

		return `*🔄 Recurring Payment Setup*\n\n✅ *Status:* Recurring payment link generated successfully\n\n*Payment Details:*\n• *Recipient:* \`${wallet_address}\`\n• *Amount:* ${amount} USDC\n• *Due Date:* ${formattedDueDate}\n• *Frequency:* ${frequencyEmoji} ${frequency}\n• *Type:* ${
			recurring ? "🔄 Recurring" : "📅 One\\-time"
		}\n${
			description ? `• *Description:* ${description}\n` : ""
		}\n🔗 *Setup Link:*\n[Click here to setup recurring payment](${recurringUrl})\n\n⚠️ *Note:* Click the link above to configure and sign the recurring payment transaction\\.`;
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

export const getMySubscriptionsTool = tool(
	async ({}, config: RunnableConfig) => {
		try {
			let userTelegramId = config["configurable"]["user_id"];
			const response = await fetch(`${API_BASE_URL}/subscriptions/get/by-telegram/${userTelegramId}`);

			if (!response.ok) {
				console.log(`HTTP Error: ${response.status} ${response.statusText}`);
				return `❌ *Error:* Unable to retrieve your subscriptions at the moment`;
			}

			const result = await response.json();

			if (result.status !== "success") {
				console.log(`API Error:`, result.msg);
				return `❌ *Error:* ${result.msg || "Unable to retrieve your subscriptions"}`;
			}

			const subs = result.data || [];

			if (!subs || subs.length === 0) {
				return `📭 *No Subscriptions Found*\n\nYou don't have any subscriptions yet\\.`;
			}

			let markdown = `*📋 Your Subscriptions*\n\n`;

			subs.forEach((sub: any, index: number) => {
				const dueDate = new Date(sub.dueDate).toLocaleString();
				const status = sub.active ? (sub.executed ? "✅ Completed" : "⏰ Pending") : "❌ Inactive";
				const recurring = sub.isRecurring ? "🔄 Recurring" : "📅 One\\-time";

				markdown += `*Subscription ${index + 1}*\n\n`;
				markdown += `• *Provider:* ${sub.provider}\n`;
				markdown += `• *Amount:* ${sub.amount} ${sub.token}\n`;
				markdown += `• *Due Date:* ${dueDate}\n`;
				markdown += `• *Status:* ${status}\n`;
				markdown += `• *Type:* ${recurring}\n`;

				if (sub.tx) {
					markdown += `• *Transaction:* \`${sub.tx}\`\n`;
				}

				markdown += `\n\\-\\-\\-\n\n`;
			});

			return markdown;
		} catch (err) {
			console.log(`Fetch Error:`, err);
			return `❌ *Error:* Something went wrong while fetching your subscriptions`;
		}
	},
	{
		name: "getMySubscriptions",
		description: "Retrieves and displays all active and inactive subscriptions for the current user, including payment details, due dates, status, and transaction information.",
		schema: z.object({}),
	}
);
