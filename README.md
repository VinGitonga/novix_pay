## Novix Pay

Novix Pay is payment service provider for onchain payments directly with HTTP Protocol. By taking advantage of x402 protocol, we enable seamless, secure, and automated payments for data and digital services, bridging the gap between the decentralized web and its foundational communication layer.

### Inspiration 💡
The foundational architecture of the internet (HTTP) and the payment layer (blockchain) have always been separate. This gap creates significant friction for the Web3 economy, especially for autonomous agents and the modern user who expects seamlessness.

For AI Agents: AI agents and APIs need a programmatic, HTTP-native way to pay for data and resources in real-time, without relying on traditional, centralized payment gateways.

For Users: Users expect a frictionless experience, where payments for premium files or content can be made with a click, without navigating complex dApps.

For Businesses: Businesses need a unified platform to manage all their on-chain revenue, whether it's from AI agents paying for API calls or users paying for subscriptions.

Novix Pay solves these challenges by providing a protocol-native solution that makes payments an intrinsic part of the HTTP request, empowering a new era of decentralized commerce.

### 🚀 Features
Novix Pay is built on x402 Protocol and Etherlink

#### Core Technology: x402 & On-Chain Payments

Our platform is built on the x402 protocol, a standard that activates the HTTP 402 "Payment Required" status code. This allows us to make payments an intrinsic part of the HTTP request, creating a native payment layer for the blockchain.

- HTTP-Native Payments: Novix Pay enables real-time, on-chain payments for data and API calls directly over the HTTP protocol.
- On-Demand Payments: This technical core is the foundation for all our payment models, from one-time transactions to recurring subscriptions.
- Stablecoin Native: All transactions are settled in USDC, providing a reliable and non-volatile payment experience.

#### For AI Agents: Programmatic Payments for Resources
AI agents can now act as independent economic actors.
- Pay for Access to Data: Agents can use the x402 protocol to pay for access to data and resources programmatically, without human intervention
- Programmatic API Monetization: This enables developers to create true pay-per-use APIs, where every single API call can be monetized with a secure, on-chain transaction.

#### For Users & Businesses: Get Paid with USDC
- For Users: Users can interact with an AI agent in Telegram to request premium files. The AI agent generates a payment link, and the user signs the transaction on the web to receive instant access. 
- For Businesses: Businesses get a unified dashboard to generate payment links for both one-time and recurring payments. They can track all revenue from AI agents and users, and manage everything from one place.

### 📸 Screenshots
![Screenshot 2](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.02.10.png?alt=media&token=405e382b-2679-4b8f-8ea1-17045e7c7980)

![Screenshot 3](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.02.30.png?alt=media&token=c7cb0586-0d25-4c14-b535-854a798f9b18)

![Screenshot 4](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.02.43.png?alt=media&token=9c29218b-6219-4e6d-a797-88bf82d957b8)

![Screenshot 5](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.02.53.png?alt=media&token=b1b3b2f3-6bb8-45ba-b606-fd3db5504440)

![Screenshot 6](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.05.29.png?alt=media&token=a0549374-1342-44cb-9f50-b620fcbe81c3)

![Screenshot 7](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.09.19.png?alt=media&token=62784beb-c0c8-4bf5-8a74-170dbe672472)

![Screenshot 8](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.46.11.png?alt=media&token=b1fa86e2-605e-4af7-a9f8-96d96622d612)

![Screenshot 9](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.46.25.png?alt=media&token=9204f9b7-d7a1-416e-ae32-c8d72438e18e)

![Screenshot 10](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2006.46.47.png?alt=media&token=72943882-46b7-4965-ab1c-3e424c00e9ed)

![Screenshot 11](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-04%20at%2007.04.56.png?alt=media&token=a0ac81b4-2911-477b-9372-127d660dff4a)

### Sponsor Tech
This project has been built using Etherlink & Thirdweb

- Etherlink has been utilized as the primary chain for the transactions, verification and settlements.

- Thirdweb has been utilized mostly on authentication, smart contract calling and getting data from blockchain

```tsx
// Connect and authenticate wallet
// components/ThirdwebConnectBtn.tsx
import { useThirdwebStore } from "@/hooks/store/useThirdwebStore";
import { defineChain } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet, type Wallet } from "thirdweb/wallets";
import { createWalletClient, custom, type Hex } from "viem";
import { etherlinkTestnet } from "viem/chains";

const wallets = [createWallet("io.metamask")];

const ThirdwebConnectBtn = () => {
	const { client, setWalletClient } = useThirdwebStore();

	const setupWalletClient = (wallet: Wallet) => {
		const account = wallet.getAccount();
		const walletClient = createWalletClient({ account: account?.address as Hex, chain: etherlinkTestnet, transport: custom(window.ethereum) });
		setWalletClient(walletClient);
	};
	return client ? (
		<ConnectButton
			client={client!}
			wallets={wallets}
			connectModal={{ size: "compact" }}
			chain={defineChain(etherlinkTestnet.id)}
			onConnect={(wallet) => setupWalletClient(wallet)}
			onDisconnect={() => setWalletClient(null)}
		/>
	) : null;
};

export default ThirdwebConnectBtn;
```
Contract Calling for recurring payments
```tsx
// RecurringPaymentCheckout.tsx 
// line 87-179
const handlePayment = async () => {
    if (!targetWallet || !amount || !activeAccount) {
        toast.error("Please connect your wallet and ensure all parameters are valid");
        return;
    }

    const isDueDate_date = isDate(new Date(dueDate));
    if (!isDueDate_date) {
        toast.error("Due date has to be a date");
        return;
    }

    // check if dueDate is in the future
    const isDueDateInFuture = isFuture(new Date(dueDate));

    if (!isDueDateInFuture) {
        toast.error("Due date has to be in the future");
        return;
    }

    const contract = getContract({
        abi: recurringPaymentABI,
        client: client!,
        chain: defineChain(etherlinkTestnetChain.id),
        address: CONTRACT_ADDRESS,
    });

    const dueDateUnix = getUnixTime(new Date(dueDate));
    const dueDateBigInt = BigInt(dueDateUnix);
    const amtInDecimals = parseUnits(amount, 6);

    const { interval, nextDueDate } = computeInterval(frequency as any, dueDate);

    const computedInterval = BigInt(interval);

    const preparedContractCall = prepareContractCall({
        contract,
        method: "schedulePayment",
        params: [targetWallet, amtInDecimals, USDC_CONTRACT_ADDRESS, dueDateBigInt, true, computedInterval],
        erc20Value: {
            amountWei: amtInDecimals,
            tokenAddress: USDC_CONTRACT_ADDRESS,
        },
    });

    setIsProcessing(true);

    const approvalTx = await getApprovalForTransaction({
        transaction: preparedContractCall as any,
        account: activeAccount,
    });

    if (approvalTx) {
        const approvalReceipt = await sendAndConfirmTransaction({
            transaction: approvalTx,
            account: activeAccount,
        });
        console.log("Approval transaction receipt:", approvalReceipt);
    } else {
        console.log("No approval needed (already sufficient allowance).");
    }

    // Send the schedulePayment transaction
    const transaction = await sendAndConfirmTransaction({
        transaction: preparedContractCall,
        account: activeAccount,
    });

    const receipt = await waitForReceipt({
        client: client!,
        chain: defineChain(etherlinkTestnetChain.id),
        transactionHash: transaction.transactionHash,
    });

    setPaymentTx(receipt.transactionHash);
    setIsProcessing(false);
    setPaymentSuccess(true);

    const dataToSave = {
        payer: activeAccount.address,
        provider: targetWallet,
        amount: parseFloat(amount),
        token: USDC_CONTRACT_ADDRESS,
        dueDate: nextDueDate,
        isRecurring: true,
        interval: interval,
        tx: receipt.transactionHash,
        tg_name: tg_username,
        tg_id: tg_id,
    } satisfies TCreateSubscription;

    const {} = await tryCatch(createSubscription(dataToSave));
};
```

### Transactions
- AI agent access resource: https://testnet.explorer.etherlink.com/tx/0x758dbf0476d5f7dbb660410fb98f5b11cea889302b541c8984a167d742f0e46e
- Subscription Payment: https://testnet.explorer.etherlink.com/tx/0xd8b5e3dd2e5403c893cc770d39c20de53bceadbd40b3efbbbcdf74bfda40ea81

### Tech Stack
Frontend: React, Typescript, Tailwind CSS
Backend: Node JS, MongoDB, x402
Blockchain: Etherlink, Smart Contracts, x402 settlement, Thirdweb
Authentication: Thirdweb

### Installation
Prequisites

- Git
- Yarn
- Pnpm
- Node JS (v23)
- Bun

#### Process

1. Clone the repo

```bash
git clone https://github.com/VinGitonga/novix_pay.git
```
2. Install dependencies

    2.1 Backend

    ```bash
    cd backend
    ```
    Use yarn to install deps
    ```bash
    yarn install
    ```

    Install x402 dependencies
    ```bash
    cd x402/typescript && pnpm install
    ```

    Create a .env file with the following values
    ```txt
    TELEGRAM_BOT_TOKEN=""
    OPENAI_API_KEY=""
    MONGODB_URI=""
    THIRDWEB_CLIENT_ID=""
    THIRDWEB_SECRET_KEY=""
    THIRDWEB_SERVER_ADDRESS=""
    WALLET_PRIVATE_KEY=""
    NODE_ENV="development"
    PINATA_API_KEY="="
    PINATA_API_SECRET=""
    PINATA_JWT=""
    ```

    Start backend
    - Start Facilitator server
    ```bash
    bun --watch src/facilitator.ts
    ```
    - Start Telegram BOT
    ```bash
    bun --watch src/app.ts
    ```
    - Start the backend service
    ```bash
    bun --watch src/index.ts
    ```

    2.2 Frontend
    ```bash
    cd app
    ```

    Use yarn to install deps
    ```bash
    yarn install
    ```

    Install x402 dependencies
    ```bash
    cd x402-typescript && pnpm install
    ```

    Start frontend
    ```
    yarn dev
    ```

3. Start Using
- Navigate to UI
```bash
http://localhost:5173
```
