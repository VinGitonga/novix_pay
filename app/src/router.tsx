import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./layouts/AppLayout";
import Subscriptions from "./pages/Subscriptions";
import LandingPage from "./pages/LandingPage";

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
				],
			},
		],
	},
]);

export default router;
