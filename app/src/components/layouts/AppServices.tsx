import useLoadAccountData from "@/hooks/useLoadAccountData";
import useUpdatePaymentApiClient from "@/hooks/useUpdatePaymentApiClient";
import type { FC, ReactNode } from "react";

interface AppServicesProps {
	children?: ReactNode;
}

const AppServices: FC<AppServicesProps> = ({ children }) => {
	useLoadAccountData();
	useUpdatePaymentApiClient()
	return <>{children}</>;
};

export default AppServices;
