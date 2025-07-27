import { SiteHeader } from "@/components/layouts/site-header";
import { CONTRACT_ADDRESS } from "@/constants";
import { recurringPaymentABI } from "@/contracts/abi";
import { useThirdwebStore } from "@/hooks/store/useThirdwebStore";
import { Button } from "@heroui/react";
import { defineChain, getContract, readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { etherlinkTestnet } from "viem/chains";

const Subscriptions = () => {
	const activeAccount = useActiveAccount();
	const { client } = useThirdwebStore();
	const getUserPayments = async () => {
		const contract = getContract({
			abi: recurringPaymentABI,
			client: client!,
			chain: defineChain(etherlinkTestnet.id),
			address: CONTRACT_ADDRESS,
		});

		const resp = await readContract({ contract, method: "getUserPayments", params: [activeAccount?.address!, false] });

		console.log("resp", resp);
	};

	return (
		<>
			<SiteHeader />
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-3">
						<div className="">
							<Button onPress={getUserPayments}>Test run</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Subscriptions;
