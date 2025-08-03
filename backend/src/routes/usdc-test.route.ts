import { Router } from "express";
import { USDC_CONTRACT_ADDRESS, WALLET_PRIVATE_KEY } from "src/constants";
import { usdcABI } from "src/contracts/usdc-abi";
import { etherlinkTestnetChain } from "src/utils";
import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const usdcRouter = Router();

const publicClient = createPublicClient({ chain: etherlinkTestnetChain, transport: http() });
const account = privateKeyToAccount(`0x${WALLET_PRIVATE_KEY}`);
const walletClient = createWalletClient({ account, chain: etherlinkTestnetChain, transport: http() });

usdcRouter.get("/get/test-tokens/:wallet_address", async (req, res) => {
	const wallet_address = req.params.wallet_address;

	const amount = 100; // in usdc
	const amtInDecimals = parseUnits(String(amount), 6);

	try {
		const tx = await walletClient.writeContract({
			address: USDC_CONTRACT_ADDRESS,
			abi: usdcABI,
			functionName: "mint",
			args: [wallet_address, amtInDecimals],
			account,
			chain: etherlinkTestnetChain,
		});

		const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

		res.status(200).json({ status: "success", msg: "100 USDC Test tokens minted", data: receipt });
	} catch (err) {
		console.log("Erororor", err);
		res.status(500).json({
			status: "error",
			msg: "An error occured",
		});
	}
});

export default usdcRouter;
