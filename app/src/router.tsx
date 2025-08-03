import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./layouts/AppLayout";
import Subscriptions from "./pages/Subscriptions";
import LandingPage from "./pages/LandingPage";
import PayWithUSDC from "./pages/PayWithUSDC";
import PaymentLinkCheckout from "./pages/PaymentLinkCheckout";
import PlansPage from "./pages/PlansPage";
import PaymentCheckout from "./pages/PaymentCheckout";
import InstantPayments from "./pages/InstantPayments";
import RecurringPaymentCheckout from "./pages/RecurringPaymentCheckout";

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
			{
				path: "make-payments/:businessId/:planId",
				element: <PaymentCheckout />,
			},
			{
				path: "instant/payments",
				element: <InstantPayments />,
			},
			{
				path: "recurring-payment-checkout",
				element: <RecurringPaymentCheckout />,
			},
		],
	},
]);

export default router;
