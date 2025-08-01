import { useParams, useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { createPublicClient, defineChain, formatUnits, http, publicActions } from "viem";
import { selectPaymentRequirements } from "x402";
import { createPaymentHeader } from "x402/schemes/exact/evm";
import { getUSDCBalance } from "x402/shared/evm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useThirdwebStore } from "@/hooks/store/useThirdwebStore";
import { safeClone } from "@/lib/utils";
import ThirdwebConnectBtn from "@/components/ThirdwebConnectBtn";
import type { PaymentLink, PaymentLinkCheckoutState } from "@/types/PaymentLink";
import { 
  ArrowLeft, 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  Copy,
  Wallet
} from "lucide-react";
import { toast } from "sonner";

// Mock data - replace with actual API call
const mockPaymentLink: PaymentLink = {
  id: "pl_123456789",
  businessId: "bus_123",
  businessName: "Tech Solutions Inc.",
  businessLogo: "https://via.placeholder.com/60x60",
  amount: "50.00",
  currency: "USDC",
  description: "Premium software license for 1 year",
  productName: "Enterprise Software License",
  productImage: "https://via.placeholder.com/300x200",
  expiresAt: "2025-08-02T23:59:59Z",
  isActive: true,
  createdAt: "2025-08-01T00:00:00Z",
  paymentRequirements: [
    {
      scheme: "exact",
      network: "etherlink-testnet",
      maxAmountRequired: "50000000", // 50 USDC in base units
      resource: "https://api.techsolutions.com/license",
      description: "Premium software license for 1 year",
      mimeType: "application/json",
      payTo: "0x68EcA16c451C55fC4613a2f982090b65234C8D8a",
      maxTimeoutSeconds: 300,
      asset: "0xe3A01f57C76B6bdf926618C910E546F794ff6dd4", // USDC on Etherlink testnet
      extra: {
        name: "USD Coin",
        version: "2",
      },
    },
  ],
};

const PaymentLinkCheckout = () => {
  const { paymentLinkId } = useParams<{ paymentLinkId: string }>();
  const navigate = useNavigate();
  
  const { walletClient } = useThirdwebStore();
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();

  const [state, setState] = useState<PaymentLinkCheckoutState>({
    isLoading: true,
    error: null,
    paymentLink: null,
    usdcBalance: "0",
    isProcessing: false,
    paymentSuccess: false,
  });

  // Define Etherlink testnet chain
  const etherlinkTestnetChain = defineChain({
    id: 128123,
    name: "Etherlink Testnet",
    nativeCurrency: {
      decimals: 18,
      name: "Tez",
      symbol: "XTZ",
    },
    rpcUrls: {
      default: { 
        http: ["https://rpc.ankr.com/etherlink_testnet/a82544020f1eaac977cf88367f722bd63ecb54ec7d3154933897a56f1038f8ad"] 
      },
    },
    blockExplorers: {
      default: {
        name: "Etherlink Testnet",
        url: "https://testnet.explorer.etherlink.com",
      },
    },
    testnet: true,
  });

  const publicClient = createPublicClient({ 
    chain: etherlinkTestnetChain, 
    transport: http() 
  }).extend(publicActions);

  // Load payment link data
  useEffect(() => {
    const loadPaymentLink = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/payment-links/${paymentLinkId}`);
        // const data = await response.json();
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        setState(prev => ({ 
          ...prev, 
          paymentLink: mockPaymentLink, 
          isLoading: false 
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: "Failed to load payment link", 
          isLoading: false 
        }));
      }
    };

    if (paymentLinkId) {
      loadPaymentLink();
    }
  }, [paymentLinkId]);

  // Check USDC balance when wallet is connected
  const checkUSDCBalance = useCallback(async () => {
    if (!activeAccount || !state.paymentLink) return;

    try {
      console.log("Checking USDC balance for address:", activeAccount.address);
      const balance = await getUSDCBalance(publicClient as any, activeAccount.address as any);
      const formattedBalance = formatUnits(balance, 6);
      console.log("USDC Balance:", formattedBalance);
      setState(prev => ({ ...prev, usdcBalance: formattedBalance }));
    } catch (error) {
      console.error("Failed to check USDC balance:", error);
      // Set a mock balance for testing
      setState(prev => ({ ...prev, usdcBalance: "100.00" }));
    }
  }, [activeAccount, state.paymentLink, publicClient]);

  useEffect(() => {
    if (activeAccount) {
      checkUSDCBalance();
    }
  }, [activeAccount, checkUSDCBalance]);

  const handlePayment = async () => {
    if (!state.paymentLink || !activeAccount || !walletClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true }));

      const paymentRequirements = selectPaymentRequirements(
        state.paymentLink.paymentRequirements, 
        "etherlink-testnet", 
        "exact"
      );

      // Ensure valid amount
      const updatedRequirements = safeClone(paymentRequirements);
      const amountInBaseUnits = Math.round(parseFloat(state.paymentLink.amount) * 1_000_000);
      updatedRequirements.maxAmountRequired = amountInBaseUnits.toString();

      // Create payment header using the correct function
      const paymentHeader = await createPaymentHeader(
        walletClient as any,
        1, // x402 version
        updatedRequirements
      );

      // TODO: Send payment to backend for processing
      // const response = await fetch('/api/payments/process', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     paymentLinkId: state.paymentLink.id,
      //     paymentHeader: paymentHeader,
      //     paymentRequirements: updatedRequirements,
      //   }),
      // });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        paymentSuccess: true 
      }));
      
      toast.success("Payment successful! You will receive your product shortly.");
    } catch (error) {
      console.error("Payment failed:", error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false 
      }));
      toast.error("Payment failed. Please try again.");
    }
  };

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Payment link copied to clipboard");
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const isExpired = state.paymentLink?.expiresAt 
    ? new Date(state.paymentLink.expiresAt) < new Date()
    : false;

  const hasInsufficientBalance = parseFloat(state.usdcBalance) < parseFloat(state.paymentLink?.amount || "0");

  // Check if wallet is connected using Thirdweb
  const isConnected = !!activeAccount;

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (state.error || !state.paymentLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Link Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {state.error || "This payment link doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-4">
                Thank you for your payment. You will receive your product shortly.
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-muted-foreground">
                  Amount: {formatAmount(state.paymentLink.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Business: {state.paymentLink.businessName}
                </p>
              </div>
              <Button onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {state.paymentLink.businessLogo && (
                <img 
                  src={state.paymentLink.businessLogo} 
                  alt={state.paymentLink.businessName}
                  className="w-12 h-12 rounded-lg"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {state.paymentLink.businessName}
                </h1>
                <p className="text-muted-foreground">Secure Payment</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={copyPaymentLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.paymentLink.productName && (
                  <div className="flex items-center space-x-4">
                    {state.paymentLink.productImage && (
                      <img 
                        src={state.paymentLink.productImage} 
                        alt={state.paymentLink.productName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{state.paymentLink.productName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {state.paymentLink.description}
                      </p>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-lg">
                      {formatAmount(state.paymentLink.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <Badge variant="secondary">{state.paymentLink.currency}</Badge>
                  </div>
                  {state.paymentLink.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="text-sm">
                        {new Date(state.paymentLink.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {isExpired && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700 font-medium">
                        This payment link has expired
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallet Connection */}
            {!isConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect Wallet
                  </CardTitle>
                  <CardDescription>
                    Connect your wallet to proceed with the payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <ThirdwebConnectBtn />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    USDC Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Your Balance:</span>
                      <span className="font-semibold">{state.usdcBalance} USDC</span>
                    </div>
                    
                    {hasInsufficientBalance && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <XCircle className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="text-yellow-700">
                            Insufficient USDC balance. You need {state.paymentLink.amount} USDC.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Summary */}
          <div className="xl:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatAmount(state.paymentLink.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee:</span>
                    <span>~$0.01</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatAmount(state.paymentLink.amount)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={
                    !isConnected || 
                    isExpired || 
                    hasInsufficientBalance || 
                    state.isProcessing
                  }
                  onClick={handlePayment}
                >
                  {state.isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay {formatAmount(state.paymentLink.amount)}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Powered by x402 • Secure USDC payments
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentLinkCheckout; 