import { useActiveAccount } from "thirdweb/react";
import useAccountData from "./useAccountData";
import { useAccountStore } from "./store/useAccountStore";
import { useEffect } from "react";

const useLoadAccountData = () => {
	const activeWalletAccount = useActiveAccount();

	const { data: accountInfo } = useAccountData(activeWalletAccount?.address!);

	const { setAccount } = useAccountStore();

	useEffect(() => {
		if (!activeWalletAccount) {
			return;
		}

		setAccount(accountInfo);
	}, [activeWalletAccount, accountInfo]);
};

export default useLoadAccountData;
