import type { ThirdwebClient } from "thirdweb";
import { create } from "zustand";

interface IThirdwebStore {
	client: ThirdwebClient | null;
	setClient: (val: ThirdwebClient | null) => void;
}

export const useThirdwebStore = create<IThirdwebStore>((set) => ({
	client: null,
	setClient(val) {
		set({ client: val });
	},
}));
