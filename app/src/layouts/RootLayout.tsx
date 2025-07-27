import useAppService from "@/hooks/useAppService";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { Outlet, useHref, useNavigate } from "react-router";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import AppServices from "@/components/layouts/AppServices";

const RootLayout = () => {
	const navigate = useNavigate();

	useAppService();
	return (
		<HeroUIProvider navigate={navigate} useHref={useHref}>
			<ToastProvider />
			<SonnerToaster />
			<AppServices />
			<div className="min-h-screen antialiased transition-colors ease-in-out duration-200 font-nunito">
				<Outlet />
			</div>
		</HeroUIProvider>
	);
};

export default RootLayout;
