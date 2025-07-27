import { Img } from "react-image";
import { TbWallet, TbMoneybag, TbBox, TbLayout2 } from "react-icons/tb";
import { RxArrowTopRight } from "react-icons/rx";
import { type ReactNode } from "react";
import { CiGlobe } from "react-icons/ci";
import ThirdwebConnectBtn from "@/components/ThirdwebConnectBtn";
import { Link } from "react-router";
import { Button, cn } from "@heroui/react";

interface HomeLinkProps {
	isActive?: boolean;
	text: string;
	href?: string;
}

interface FeatureCardProps {
	title: string;
	description: string;
	icon: ReactNode;
}

interface StepItemProps {
	title: string;
	description: string;
}

const LandingPage = () => {
	return (
		<div className="min-h-screen overflow-y-auto w-screen text-white bg-[#130D26] pt-4">
			<div className="mt-2 flex items-center justify-between px-20">
				<Link to={"/"}>
					<Img src="/images/logo.png" className="w-48" width={100} height={100} alt="Logo" />
				</Link>
				<div className="flex items-center gap-4">
					<HomeLink href="/" isActive text="Home" />
					<HomeLink href="/" text="Features" />
					<HomeLink href="/" text="How It Works" />
					<div className="ml-5">
						<ThirdwebConnectBtn />
					</div>
				</div>
			</div> 
			<div className="mt-2 grid grid-cols-1 md:grid-cols-8 pl-20">
				<div className="col-auto md:col-span-4 mt-12 space-y-10">
					<div className="text-6xl font-bold">
						<span>Pay, Get Paid with USDC</span>
						<span className="text-transparent bg-gradient-to-tr bg-clip-text from-[#FFFFFF] to-[#FF6106]"> Setup all your payments in one place</span>
					</div>
					<div className="mt-8">
						<p className="text-lg">Get started with a unified, secure, and developer-friendly platform for on-chain payments and monetization.</p>
					</div>
					<div className="mt-5 flex items-center gap-3">
						<ThirdwebConnectBtn />
						<Button>Get Started</Button>
					</div>
				</div>
				<div className="col-auto md:col-span-4">
					<Img src={"/images/hero-img.png"} alt="Hero" className="w-full" width={100} height={100} />
				</div>
			</div>
			<div className="px-20 mt-3 relative">
				<div className="absolute left-[30%] top-6 w-full pointer-events-none z-10">
					<Img src={"/images/eclipse-bg.png"} className="" width={700} alt="Hero" height={100} />
				</div>
				<div className="w-full relative z-20">
					<div className="text-center space-y-4">
						<h1 className="text-4xl font-semibold">Why Choose Novix Pay?</h1>
						<p className="text-lg px-10">
							Nova brings the traditional chama model to the blockchain. Save for shared goals, lend with fairness, and invest in bold ideas—all with the trust of DeFi. Built for Base Sepolia's secure
							testnet, Nova makes group finance accessible with just a few clicks.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-15">
						<FeatureCard title="Pool & Save" description="Deposit as little as 5 usd to the shared pool to grow together." icon={<TbWallet className="w-6 h-6" />} />
						<FeatureCard title="Request Loans" description="Apply for loans with fair rates (0-20%), approved by group votes." icon={<TbMoneybag className="w-6 h-6" />} />
						<FeatureCard title="Vote as a Team" description="Every member votes on loans and investments to keep funds wise and fair." icon={<TbBox className="w-6 h-6" />} />
						<FeatureCard title="Track Portfolio" description="Monitor contributions, balances, and history in real time." icon={<TbLayout2 className="w-6 h-6" />} />
					</div>
				</div>
			</div>
			<div className="px-24 mt-28">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<Img src={"/images/steps-img.png"} className="w-full" width={100} height={100} alt="Steps" />
					<div className="pt-5">
						<h1 className="font-semibold text-3xl">4 Steps to Join the Chama with Nova</h1>
						<div className="space-y-6 mt-4">
							<StepItem title="Connect Wallet" description="Link your Base Sepolia wallet in seconds." />
							<StepItem title="Deposit Funds" description="Add USD or ETH to the shared pool." />
							<StepItem title="Lend/Invest" description="Apply for loans or propose projects." />
							<StepItem title="Track Progress" description="Watch your portfolio grow" />
						</div>
					</div>
				</div>
			</div>
			<div className="mt-5 bg-gradient-to-b from-[#130D26] to-[#FF6106] pt-5 px-20 relative">
				<div className="absolute left-0 -top-10 w-full pointer-events-none z-10">
					<Img src={"/images/blue-eclipse.png"} className="w-full" width={700} alt="Hero" height={100} />
				</div>
				<div className="flex flex-col items-center space-y-8 z-20 relative">
					<h1 className="text-3xl font-semibold">Ready to Start?</h1>
					<p className="text-lg">Connect your wallet and join the chama revolution today!</p>
					<ThirdwebConnectBtn />
					<hr className="border-white w-full" />
				</div>
				<div className="flex items-center justify-between py-5 px-8">
					<Img src="/images/logo.png" className="w-32" width={100} height={50} alt="Logo" />
					<p>&copy; 2025 Nova. All Rights Reserved. </p>
					<CiGlobe className="w-6 h-6" />
				</div>
			</div>
		</div>
	);
};

const HomeLink = ({ text, isActive, href }: HomeLinkProps) => {
	return (
		<Link to={href ?? "/"}>
			<p
				className={cn(
					isActive
						? "text-[#FF6106] font-bold hover:underline hover:underline-offset-4 transition-all duration-300"
						: "hover:text-[#FF6106] hover:font-bold hover:underline hover:underline-offset-4 transition-all duration-300"
				)}>
				{text}
			</p>
		</Link>
	);
};

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
	return (
		<div className="p-[0.5px] rounded-2xl bg-gradient-to-r from-[#FF6106] to-[#FFFFFF]">
			<div className="px-3 py-4 bg-[#1C1337] rounded-2xl">
				<div className="flex items-center justify-between">
					<div className="size-10 bg-gradient-to-b from-[#1C1337] to-white rounded-full flex items-center justify-center">{icon}</div>
					<RxArrowTopRight className="w-6 h-6" />
				</div>
				<div className="mt-2 space-y-4">
					<h1 className="font-semibold text-lg">{title}:</h1>
					<p className="text-sm">{description}</p>
				</div>
			</div>
		</div>
	);
};

const StepItem = ({ title, description }: StepItemProps) => {
	return (
		<div className="flex gap-3">
			<Img src={"/images/steps-arrow-img.png"} width={40} height={10} alt="Arrow" />
			<div className="space-y-3">
				<h2 className="text-lg font-semibold">{title}</h2>
				<p className="text-sm">{description}</p>
			</div>
		</div>
	);
};

export default LandingPage;
