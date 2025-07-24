import AppInput from "@/components/forms/AppInput";
import ThirdwebConnectBtn from "@/components/ThirdwebConnectBtn";
import { CONTRACT_ADDRESS } from "@/constants";
import { recurringPaymentABI } from "@/contracts/abi";
import { useThirdwebStore } from "@/hooks/store/useThirdwebStore";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { defineChain, getContract, prepareContractCall, readContract, sendAndConfirmTransaction, toWei, waitForReceipt, type ThirdwebClient } from "thirdweb";
import { etherlinkTestnet } from "viem/chains";
import { WalletIcon } from "lucide-react";
import AppDatePicker from "@/components/forms/AppDatePicker";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { z } from "zod";
import * as ethers from "ethers";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActiveAccount } from "thirdweb/react";
import { getApprovalForTransaction } from "thirdweb/extensions/erc20";
import { extractErrorDetails } from "@/DecodeEvmTransactionLogsArgs";
import type { Account } from "thirdweb/wallets";

const dateSchema = z.custom<CalendarDate>(
  (val) => val instanceof CalendarDate,
  { message: "Invalid Date" }
);

const formObject = z.object({
  provider: z.string().refine((value) => ethers.isAddress(value), {
    message: "Provided address is invalid. Please ensure you have typed correctly.",
  }),
  amount: z.coerce.number<number>().positive("Amount must be greater than 0"),
  dueDate: dateSchema,
});

const HomeScreen = () => {
  const { client } = useThirdwebStore();
  const activeAccount = useActiveAccount();

  const getDuePayments = async () => {
    const contract = getContract({
      abi: recurringPaymentABI,
      client: client!,
      chain: defineChain(etherlinkTestnet.id),
      address: CONTRACT_ADDRESS,
    });
    const resp = await readContract({
      contract,
      method: "getDuePayments",
      params: [],
    });
    console.log("Due payments:", resp);
  };

  return (
    <div className="flex items-center justify-center h-svh">
      <ThirdwebConnectBtn />
      <Button onPress={getDuePayments}>Test run</Button>
      <SchedulePaymentModal client={client!} account={activeAccount!} />
    </div>
  );
};

const SchedulePaymentModal = ({ client, account }: { client: ThirdwebClient; account: Account }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const formMethods = useForm<z.infer<typeof formObject>>({
    resolver: zodResolver(formObject),
    defaultValues: {
      provider: "",
      dueDate: today(getLocalTimeZone()),
      amount: 1,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = formMethods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const contract = getContract({
        abi: recurringPaymentABI,
        client,
        chain: defineChain(etherlinkTestnet.id),
        address: CONTRACT_ADDRESS,
      });

      const usdtAddress = "0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B"; // Verify this is correct for Etherlink Testnet
      const dueDateUnix = Math.floor(new Date(data.dueDate.toString()).valueOf() / 1000);
      const amtInDecimals = ethers.parseUnits(String(data.amount), 6); // USDT has 6 decimals

      console.log("Submitting with:", { provider: data.provider, amount: amtInDecimals.toString(), dueDateUnix });

      // Prepare the schedulePayment transaction
      const preparedContractCall = prepareContractCall({
        contract,
        method: "schedulePayment",
        params: [data.provider, amtInDecimals, usdtAddress, BigInt(dueDateUnix), false, BigInt(0)],
		erc20Value: {
			amountWei: amtInDecimals,
			tokenAddress: usdtAddress
		}
      });

      // Check if approval is needed for USDT
      const approvalTx = await getApprovalForTransaction({
        transaction: preparedContractCall as any,
        account,
      });

      if (approvalTx) {
        console.log("Approval needed, sending approval transaction...");
        const approvalReceipt = await sendAndConfirmTransaction({
          transaction: approvalTx,
          account,
        });
        console.log("Approval transaction receipt:", approvalReceipt);
      } else {
        console.log("No approval needed (already sufficient allowance).");
      }

      // Send the schedulePayment transaction
      const transaction = await sendAndConfirmTransaction({
        transaction: preparedContractCall,
        account,
      });

      const receipt = await waitForReceipt({
        client,
        chain: defineChain(etherlinkTestnet.id),
        transactionHash: transaction.transactionHash,
      });

      console.log("Schedule payment receipt:", receipt);
    } catch (err) {
      console.error("Error:", err);
      const errorParsed = extractErrorDetails(err, recurringPaymentABI);
      console.error("Parsed error:", errorParsed);
    }
  });

  return (
    <>
      <Button onPress={onOpen}>Schedule Payments</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="font-nunito">
          {(onClose) => (
            <FormProvider {...formMethods}>
              <form onSubmit={onSubmit}>
                <ModalHeader className="flex flex-col gap-1">Schedule Payments</ModalHeader>
                <ModalBody>
                  <AppInput
                    name="provider"
                    control={control}
                    error={errors.provider}
                    label="Provider Address"
                    placeholder="0x...8999"
                    endContent={<WalletIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />}
                    labelPlacement="inside"
                  />
                  <AppInput
                    name="amount"
                    control={control}
                    error={errors.amount}
                    label="Amount"
                    placeholder="10"
                    labelPlacement="inside"
                    type="number"
                  />
                  <AppDatePicker
                    name="dueDate"
                    control={control}
                    error={errors.dueDate}
                    label="Due Date"
                    minDate={today(getLocalTimeZone())}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" type="button" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" type="submit">
                    Schedule
                  </Button>
                </ModalFooter>
              </form>
            </FormProvider>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default HomeScreen;