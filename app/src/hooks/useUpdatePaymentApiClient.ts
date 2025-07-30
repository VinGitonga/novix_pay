import { useEffect } from "react";
import { useThirdwebStore } from "./store/useThirdwebStore";
import { updateApiClient } from "@/lib/paymentApiClient";

const useUpdatePaymentApiClient = () => {
	const { walletClient } = useThirdwebStore();

	useEffect(() => {
		if (walletClient) {
			updateApiClient(walletClient);
		}
	}, [walletClient]);
};

export default useUpdatePaymentApiClient;
