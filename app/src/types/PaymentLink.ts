export interface PaymentLink {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  amount: string;
  currency: string;
  description: string;
  productName?: string;
  productImage?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  paymentRequirements: PaymentRequirements[];
}

export interface PaymentRequirements {
  scheme: "exact";
  network: "etherlink-testnet" | "base-sepolia" | "base" | "avalanche-fuji" | "avalanche" | "iotex";
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: {
    name: string;
    version: string;
  };
}

export interface PaymentLinkCheckoutState {
  isLoading: boolean;
  error: string | null;
  paymentLink: PaymentLink | null;
  usdcBalance: string;
  isProcessing: boolean;
  paymentSuccess: boolean;
} 