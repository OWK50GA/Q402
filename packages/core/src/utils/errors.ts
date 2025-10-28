/**
 * Base error class for x402 BNB errors
 */
export class X402BnbError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "X402BnbError";
  }
}

/**
 * Payment validation error
 */
export class PaymentValidationError extends X402BnbError {
  constructor(message: string, details?: unknown) {
    super(message, "PAYMENT_VALIDATION_ERROR", details);
    this.name = "PaymentValidationError";
  }
}

/**
 * Signature error
 */
export class SignatureError extends X402BnbError {
  constructor(message: string, details?: unknown) {
    super(message, "SIGNATURE_ERROR", details);
    this.name = "SignatureError";
  }
}

/**
 * Network error
 */
export class NetworkError extends X402BnbError {
  constructor(message: string, details?: unknown) {
    super(message, "NETWORK_ERROR", details);
    this.name = "NetworkError";
  }
}

/**
 * Transaction error
 */
export class TransactionError extends X402BnbError {
  constructor(message: string, details?: unknown) {
    super(message, "TRANSACTION_ERROR", details);
    this.name = "TransactionError";
  }
}

