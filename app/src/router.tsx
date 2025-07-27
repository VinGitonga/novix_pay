import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import HomeScreen from "./pages/HomeScreen";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./layouts/AppLayout";

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				path: "",
				element: <HomeScreen />,
			},
			{
				path: "app",
				element: <AppLayout />,
				children: [
					{
						path: "",
						element: <Dashboard />,
					},
				],
			},
		],
	},
]);

export default router;
