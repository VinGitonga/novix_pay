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
