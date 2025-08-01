import { useState, useEffect } from "react";
import type { PaymentLink } from "@/types/PaymentLink";

export const usePaymentLink = (paymentLinkId: string) => {
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentLink = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        // const response = await fetch(`/api/payment-links/${paymentLinkId}`);
        // if (!response.ok) {
        //   throw new Error('Payment link not found');
        // }
        // const data = await response.json();
        // setPaymentLink(data);

        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockPaymentLink: PaymentLink = {
          id: paymentLinkId,
          businessId: "bus_123",
          businessName: "Tech Solutions Inc.",
          businessLogo: "https://via.placeholder.com/60x60",
          amount: "50.00",
          currency: "USDC",
          description: "Premium software license for 1 year",
          productName: "Enterprise Software License",
          productImage: "https://via.placeholder.com/300x200",
          expiresAt: "2024-12-31T23:59:59Z",
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          paymentRequirements: [
            {
              scheme: "exact",
              network: "etherlink-testnet",
              maxAmountRequired: "50000000",
              resource: "https://api.techsolutions.com/license",
              description: "Premium software license for 1 year",
              mimeType: "application/json",
              payTo: "0x68EcA16c451C55fC4613a2f982090b65234C8D8a",
              maxTimeoutSeconds: 300,
              asset: "0xe3A01f57C76B6bdf926618C910E546F794ff6dd4",
              extra: {
                name: "USD Coin",
                version: "2",
              },
            },
          ],
        };
        setPaymentLink(mockPaymentLink);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment link');
      } finally {
        setIsLoading(false);
      }
    };

    if (paymentLinkId) {
      fetchPaymentLink();
    }
  }, [paymentLinkId]);

  return { paymentLink, isLoading, error };
}; 