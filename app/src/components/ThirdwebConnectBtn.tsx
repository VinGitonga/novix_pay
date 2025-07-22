import { useThirdwebStore } from "@/hooks/store/useThirdwebStore";
import { defineChain } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { etherlinkTestnet } from "viem/chains";

const wallets = [createWallet("io.metamask")];

const ThirdwebConnectBtn = () => {
	const { client } = useThirdwebStore();
	return client ? <ConnectButton client={client!} wallets={wallets} connectModal={{ size: "compact" }} chain={defineChain(etherlinkTestnet.id)} /> : null;
};

export default ThirdwebConnectBtn;
