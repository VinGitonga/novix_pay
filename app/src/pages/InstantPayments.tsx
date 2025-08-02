import ThirdwebConnectBtn from "@/components/ThirdwebConnectBtn";
import { formatAmount } from "@/lib/utils";
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider, Input } from "@heroui/react";
import { ArrowLeftIcon, CheckCircleIcon, CopyIcon, CreditCardIcon, DollarSignIcon, Loader2Icon, WalletIcon, XCircleIcon, ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";

const InstantPayments = () => {
	const [searchParams] = useSearchParams();
	const activeAccount = useActiveAccount();
	const navigate = useNavigate();

	// Get search params
	const targetWallet = searchParams.get("account") || "";
	const amount = searchParams.get("amt") || "";
	const description = searchParams.get("description") || "Instant Payment";

	const [usdcBalance, setUsdcBalance] = useState<string>("0");
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
	const [isValidParams, setIsValidParams] = useState<boolean>(true);

	const copyPaymentLink = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success("Payment link copied to clipboard");
	};

	const handlePayment = async () => {
		if (!targetWallet || !amount || !activeAccount) {
			toast.error("Please connect your wallet and ensure all parameters are valid");
			return;
		}

		setIsProcessing(true);
		
		// Simulate payment processing
		setTimeout(() => {
			setIsProcessing(false);
			setPaymentSuccess(true);
			toast.success("Payment successful");
		}, 2000);
	};

	// Validate search params on component mount
	useEffect(() => {
		if (!targetWallet || !amount || isNaN(parseFloat(amount))) {
			setIsValidParams(false);
		}
	}, [targetWallet, amount]);

	// Simulate USDC balance check
	useEffect(() => {
		if (activeAccount) {
			// Simulate balance check
			setUsdcBalance("150.50");
		}
	}, [activeAccount]);

	const hasInsufficientBalance = parseFloat(usdcBalance) < parseFloat(amount);
	const isConnected = !!activeAccount;

	if (!isValidParams) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
				<Card className="w-full max-w-md bg-transparent">
					<CardBody className="pt-6">
						<div className="text-center">
							<XCircleIcon className="h-12 w-12 text-danger mx-auto mb-4" />
							<h2 className="text-xl font-semibold mb-2">Invalid Payment Link</h2>
							<p className="text-muted-foreground mb-4">This payment link is missing required parameters (wallet address and amount).</p>
							<Button color="secondary" startContent={<ArrowLeftIcon className="h-4 w-4 mr-2" />} onPress={() => navigate("/")}>
								Go Home
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	if (paymentSuccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
				<Card className="w-full max-w-md bg-transparent">
					<CardBody>
						<div className="text-center">
							<CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
							<h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
							<p className="text-muted-foreground mb-4">Your instant payment has been processed successfully.</p>
							<div className="space-y-2 mb-6">
								<p className="text-sm text-muted-foreground">Amount: {formatAmount(amount)}</p>
								<p className="text-sm text-muted-foreground">To: {targetWallet.slice(0, 6)}...{targetWallet.slice(-4)}</p>
							</div>
							<Button onPress={() => navigate("/")}>
								<ArrowLeftIcon className="h-4 w-4 mr-2" />
								Return Home
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<div className="mb-4">
						<Button color="secondary" variant="ghost" startContent={<ArrowLeftIcon className="h-4 w-4" />} onPress={() => navigate("/")}>
							Back
						</Button>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
								<DollarSignIcon className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Instant Payment</h1>
								<p className="text-muted-foreground">Quick and secure USDC transfer</p>
							</div>
						</div>
						<Button color="secondary" variant="bordered" size="sm" onPress={copyPaymentLink}>
							<CopyIcon className="h-4 w-4 mr-2" />
							Copy Link
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
					<div className="xl:col-span-2 space-y-6">
						<Card className="bg-transparent">
							<CardHeader className="gap-2">
								<CreditCardIcon className="h-5 w-5" />
								<h2>Payment Details</h2>
							</CardHeader>
							<CardBody className="space-y-4">
								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
										<Input
											value={description}
											isReadOnly
											variant="bordered"
											placeholder="Payment description"
											className="w-full"
										/>
									</div>
									
									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">Target Wallet Address</label>
										<div className="flex items-center space-x-2">
											<Input
												value={targetWallet}
												isReadOnly
												variant="bordered"
												placeholder="0x..."
												className="w-full font-mono text-sm"
											/>
											<Button
												isIconOnly
												size="sm"
												variant="bordered"
												onPress={() => {
													navigator.clipboard.writeText(targetWallet);
													toast.success("Wallet address copied");
												}}
											>
												<CopyIcon className="h-4 w-4" />
											</Button>
											<Button
												isIconOnly
												size="sm"
												variant="bordered"
												onPress={() => window.open(`https://testnet.explorer.etherlink.com/address/${targetWallet}`, '_blank')}
											>
												<ExternalLinkIcon className="h-4 w-4" />
											</Button>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">Amount (USDC)</label>
										<Input
											value={amount}
											isReadOnly
											variant="bordered"
											placeholder="0.00"
											startContent={<DollarSignIcon className="h-4 w-4 text-muted-foreground" />}
											className="w-full"
										/>
									</div>
								</div>

								<Divider />

								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Amount:</span>
										<span className="font-semibold text-lg">{formatAmount(amount)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Currency:</span>
										<Chip size="sm" color="secondary">
											USDC
										</Chip>
									</div>
								</div>
							</CardBody>
						</Card>

						{!isConnected ? (
							<Card className="bg-transparent">
								<CardHeader>
									<div className="space-y-2">
										<div className="flex items-center">
											<WalletIcon className="w-5 h-5 mr-2" />
											Connect Wallet
										</div>
										<p className="text-gray-600 text-sm">Connect your wallet to proceed with your payment</p>
									</div>
								</CardHeader>
								<CardBody>
									<div className="flex justify-center">
										<ThirdwebConnectBtn />
									</div>
								</CardBody>
							</Card>
						) : (
							<Card className="bg-transparent">
								<CardHeader>
									<div className="flex items-center">
										<DollarSignIcon className="w-5 h-5 mr-2" />
										USDC Balance
									</div>
								</CardHeader>
								<CardBody>
									<div className="space-y-4">
										<div className="flex justify-between items-center">
											<span className="text-muted-foreground">Your Balance:</span>
											<span className="font-semibold">{usdcBalance} USDC</span>
										</div>
										{hasInsufficientBalance && (
											<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
												<div className="flex items-center">
													<XCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
													<span className="text-yellow-700">Insufficient USDC balance. You need {amount} USDC.</span>
												</div>
											</div>
										)}
									</div>
								</CardBody>
							</Card>
						)}
					</div>

					<div className="xl:col-span-1">
						<Card className="bg-transparent sticky top-0">
							<CardHeader>Payment Summary</CardHeader>
							<CardBody className="space-y-4">
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Transfer Amount:</span>
										<span>{formatAmount(amount)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Network Fee:</span>
										<span>~$0.01</span>
									</div>
									<Divider />
									<div className="flex justify-between font-semibold text-lg">
										<span>Total:</span>
										<span>{formatAmount(amount)}</span>
									</div>
								</div>

								<div className="space-y-3">
									<Button 
										size="lg" 
										color="secondary" 
										onPress={handlePayment} 
										isLoading={isProcessing || !isConnected || hasInsufficientBalance} 
										isDisabled={isProcessing}
										className="w-full"
									>
										{isProcessing ? "Processing..." : `Send ${formatAmount(amount)}`}
									</Button>

									<div className="text-xs text-muted-foreground text-center">
										<p>This payment will be sent to:</p>
										<p className="font-mono text-xs break-all mt-1">
											{targetWallet.slice(0, 10)}...{targetWallet.slice(-8)}
										</p>
									</div>
								</div>
							</CardBody>
							<CardFooter>
								<div className="text-xs text-muted-foreground text-center w-full">
									Powered by Novix Pay with x402 • Secure USDC payments
								</div>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InstantPayments;
