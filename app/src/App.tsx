import { RouterProvider } from "react-router";
import router from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./lib/wagmiConfig";

const queryClient = new QueryClient();

const App = () => {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</WagmiProvider>
	);
};

export default App;
