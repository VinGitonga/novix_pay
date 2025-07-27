// import { createThirdwebClient, Engine } from "thirdweb";
import { CONTRACT_ADDRESS, THIRDWEB_SECRET_KEY, WALLET_PRIVATE_KEY } from "./constants";
import { recurringPaymentABI } from "./contracts/abi";
import { etherlinkTestnet } from "viem/chains";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// const client = createThirdwebClient({ secretKey: THIRDWEB_SECRET_KEY });


// async function getWallets() {
// 	const wallets = await Engine.getServerWallets({ client });

// 	console.log(wallets);
// }

const publicClient = createPublicClient({ chain: etherlinkTestnet, transport: http("https://node.ghostnet.etherlink.com") });
const account = privateKeyToAccount(`0x${WALLET_PRIVATE_KEY}`);
const walletClient = createWalletClient({ account, chain: etherlinkTestnet, transport: http("https://node.ghostnet.etherlink.com") });

async function testExecutePayment() {
	try {
		const tx = await walletClient.writeContract({
			address: CONTRACT_ADDRESS,
			abi: recurringPaymentABI,
			functionName: "executePayment",
			args: [BigInt(3)],
			account,
			chain: etherlinkTestnet,
		});

		const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

		console.log("Receipt", receipt);
	} catch (err) {
		console.log(`Erroror`, err);
	}
}

testExecutePayment();
