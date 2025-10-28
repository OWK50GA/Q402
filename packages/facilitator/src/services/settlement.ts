import type { SignedPaymentPayload } from "@x402-bnb/core";
import { settlePayment } from "@x402-bnb/core";
import type { SettlementResult } from "@x402-bnb/core";
import type { NetworkClients } from "../config/networks";

/**
 * Settle a payment using the appropriate network client
 */
export async function settlePaymentWithMonitoring(
  payload: SignedPaymentPayload,
  clients: NetworkClients,
): Promise<SettlementResult> {
  // Log settlement attempt
  console.log(`Settling payment for ${payload.paymentDetails.amount} tokens`);
  console.log(`Payer: ${payload.authorization.address}`);
  console.log(`Recipient: ${payload.paymentDetails.to}`);

  try {
    const result = await settlePayment(clients.walletClient, payload);

    if (result.success) {
      console.log(`Settlement successful: ${result.txHash}`);
      console.log(`Block number: ${result.blockNumber}`);
    } else {
      console.error(`Settlement failed: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error("Settlement error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

