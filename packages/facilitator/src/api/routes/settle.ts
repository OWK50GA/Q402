import type { Request, Response } from "express";
import type { SignedPaymentPayload, SupportedNetwork } from "@x402-bnb/core";
import { SignedPaymentPayloadSchema } from "@x402-bnb/core";
import { settlePaymentWithMonitoring } from "../../services/settlement";
import { getNetworkClients, type NetworkClients } from "../../config/networks";

/**
 * POST /settle
 * Settle a payment by submitting transaction
 */
export async function handleSettle(
  req: Request,
  res: Response,
  clientsMap: Map<SupportedNetwork, NetworkClients>,
): Promise<void> {
  try {
    // Validate request body
    const parseResult = SignedPaymentPayloadSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid payment payload",
        details: parseResult.error.errors,
      });
      return;
    }

    const payload: SignedPaymentPayload = parseResult.data as SignedPaymentPayload;

    // Get network clients
    const clients = getNetworkClients(clientsMap, payload.paymentDetails.networkId);

    if (!clients) {
      res.status(400).json({
        error: "Unsupported network",
        network: payload.paymentDetails.networkId,
      });
      return;
    }

    // Settle payment
    const result = await settlePaymentWithMonitoring(payload, clients);

    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
        blockNumber: result.blockNumber?.toString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Settlement error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

