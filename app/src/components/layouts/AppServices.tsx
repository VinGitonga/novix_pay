import useLoadAccountData from "@/hooks/useLoadAccountData";
import type { FC, ReactNode } from "react";

interface AppServicesProps {
	children?: ReactNode;
}

const AppServices: FC<AppServicesProps> = ({ children }) => {
	useLoadAccountData();
	return <>{children}</>;
};

export default AppServices;
