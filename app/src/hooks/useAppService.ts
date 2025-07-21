import { createThirdwebClient } from "thirdweb";
import { useThirdwebStore } from "./store/useThirdwebStore";
import { useEffect } from "react";
import { THIRDWEB_CLIENT_ID } from "@/constants";

const useAppService = () => {
	const { setClient, client } = useThirdwebStore();
	const createThirdWebClientInit = () => {
		const client = createThirdwebClient({
			clientId: THIRDWEB_CLIENT_ID!,
		});

		setClient(client);
	};

	useEffect(() => {
		if (!client) {
			createThirdWebClientInit();
		}
	}, [client]);
};

export default useAppService;
