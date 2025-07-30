import type { ThirdwebClient } from "thirdweb";
import type { WalletClient } from "viem";
import { create } from "zustand";

interface IThirdwebStore {
	client: ThirdwebClient | null;
	setClient: (val: ThirdwebClient | null) => void;
	walletClient: WalletClient | null;
	setWalletClient: (val: WalletClient | null) => void;
}

export const useThirdwebStore = create<IThirdwebStore>((set) => ({
	client: null,
	setClient(val) {
		set({ client: val });
	},
	walletClient: null,
	setWalletClient(val) {
		set({ walletClient: val });
	},
}));
