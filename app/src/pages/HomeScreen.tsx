import ThirdwebConnectBtn from "@/components/ThirdwebConnectBtn";
import { CONTRACT_ADDRESS } from "@/constants";
import { recurringPaymentABI } from "@/contracts/abi";
import { useThirdwebStore } from "@/hooks/store/useThirdwebStore";
import { Button } from "@heroui/react";
import { defineChain, getContract, readContract } from "thirdweb";
import { etherlinkTestnet } from "viem/chains";

const HomeScreen = () => {
	const { client } = useThirdwebStore();
	const getDuePayments = async () => {
		const resp = await readContract({
			contract: getContract({
				abi: recurringPaymentABI,
				client: client!,
				chain: defineChain(etherlinkTestnet.id),
				address: CONTRACT_ADDRESS,
			}),
			method: "getDuePayments",
			params: [],
		});

		console.log('resp', resp)
	};
	return (
		<div className="flex items-center justify-center h-svh">
			<ThirdwebConnectBtn />
			<Button onPress={getDuePayments}>Test run</Button>
		</div>
	);
};

export default HomeScreen;
