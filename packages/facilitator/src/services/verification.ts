import type { SignedPaymentPayload } from "@x402-bnb/core";
import { verifyPayment } from "@x402-bnb/core";
import type { VerificationResult } from "@x402-bnb/core";
import type { EnvConfig } from "../config/env";
import { ErrorReason } from "@x402-bnb/core";

/**
 * Verify a payment with additional checks
 */
export async function verifyPaymentWithChecks(
  payload: SignedPaymentPayload,
  config: EnvConfig,
): Promise<VerificationResult> {
  // Check implementation contract is whitelisted
  if (config.implementationWhitelist.length > 0) {
    const isWhitelisted = config.implementationWhitelist.some(
      (addr) =>
        addr.toLowerCase() === payload.paymentDetails.implementationContract.toLowerCase(),
    );

    if (!isWhitelisted) {
      return {
        isValid: false,
        invalidReason: ErrorReason.INVALID_IMPLEMENTATION,
      };
    }
  }

  // Perform standard verification
  return await verifyPayment(payload);
}

