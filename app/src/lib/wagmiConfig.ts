import { createConfig, http, injected } from "wagmi";
import { etherlinkTestnet } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
	chains: [etherlinkTestnet],
	connectors: [injected(), metaMask()],
	transports: {
		[etherlinkTestnet.id]: http("https://node.ghostnet.etherlink.com"),
	},
});
