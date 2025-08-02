import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./layouts/AppLayout";
import Subscriptions from "./pages/Subscriptions";
import LandingPage from "./pages/LandingPage";
import PayWithUSDC from "./pages/PayWithUSDC";
import PaymentLinkCheckout from "./pages/PaymentLinkCheckout";
import PlansPage from "./pages/PlansPage";

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				path: "",
				element: <LandingPage />,
			},
			{
				path: "app",
				element: <AppLayout />,
				children: [
					{
						path: "",
						element: <Dashboard />,
					},
					{
						path: "subscriptions",
						element: <Subscriptions />,
					},
					{
						path: "pay-with-usdc",
						element: <PayWithUSDC />,
					},
					{
						path: "plans",
						element: <PlansPage />,
					},
				],
			},
			{
				path: "pay/:paymentLinkId",
				element: <PaymentLinkCheckout />,
			},
		],
	},
]);

export default router;
