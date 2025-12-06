import { S as SignedPaymentPayload, W as WitnessMessage, P as PaymentItem, B as BatchWitnessMessage, E as Eip712Domain, U as UnsignedAuthorizationTuple, A as AuthorizationTuple, i as PaymentDetails, b as SupportedNetwork, k as PaymentRequiredResponse } from '../payment-B_z5dGJY.mjs';
import { Address, Hex, LocalAccount, PrivateKeyAccount, WalletClient } from 'viem';

/**
 * Facilitator Client for q402 Protocol
 *
 * HTTP client for communicating with facilitator services.
 * This replaces the local facilitator logic in core package.
 */

/**
 * Facilitator API response types (matching x402 standard)
 */
interface FacilitatorVerificationResponse {
    isValid: boolean;
    invalidReason?: string;
    payer?: string;
    details?: {
        witnessValid: boolean;
        authorizationValid: boolean;
        amountValid: boolean;
        deadlineValid: boolean;
        recipientValid: boolean;
    };
}
interface FacilitatorSettlementResponse {
    success: boolean;
    txHash?: string;
    blockNumber?: string;
    error?: string;
}
interface FacilitatorSupportedResponse {
    kinds: Array<{
        scheme: string;
        network: string;
    }>;
}
/**
 * Standard x402 facilitator client
 */
declare class FacilitatorClient {
    private readonly baseUrl;
    constructor(baseUrl: string);
    /**
     * Verify a payment payload with the facilitator
     * POST /verify endpoint
     */
    verify(payload: SignedPaymentPayload): Promise<FacilitatorVerificationResponse>;
    /**
     * Settle a payment through the facilitator
     * POST /settle endpoint
     */
    settle(payload: SignedPaymentPayload): Promise<FacilitatorSettlementResponse>;
    /**
     * Get supported payment schemes and networks
     * GET /supported endpoint
     */
    getSupported(): Promise<FacilitatorSupportedResponse>;
    /**
     * Health check endpoint
     */
    health(): Promise<{
        status: string;
    }>;
}
/**
 * Default facilitator client instance
 * Can be configured via environment variables
 */
declare function createFacilitatorClient(baseUrl?: string): FacilitatorClient;
/**
 * Convenience functions for direct API calls
 */
declare function verifyPaymentWithFacilitator(payload: SignedPaymentPayload, facilitatorUrl?: string): Promise<FacilitatorVerificationResponse>;
declare function settlePaymentWithFacilitator(payload: SignedPaymentPayload, facilitatorUrl?: string): Promise<FacilitatorSettlementResponse>;

/**
 * Options for preparing witness message
 */
interface PrepareWitnessOptions {
    /**
     * Owner/payer address
     */
    owner: Address;
    /**
     * Token contract address
     */
    token: Address;
    /**
     * Amount in atomic units
     */
    amount: bigint | string;
    /**
     * Recipient address
     */
    to: Address;
    /**
     * Optional deadline (default: 15 minutes from now)
     */
    deadline?: bigint;
    /**
     * Optional payment ID (auto-generated if not provided)
     */
    paymentId?: Hex;
    /**
     * Optional nonce (auto-generated if not provided)
     */
    nonce?: bigint;
}
/**
 * Prepare a witness message for single payment
 */
declare function prepareWitness(options: PrepareWitnessOptions): WitnessMessage;
/**
 * Options for preparing batch witness message
 */
interface PrepareBatchWitnessOptions {
    owner: Address;
    items: PaymentItem[];
    deadline?: bigint;
    paymentId?: Hex;
    nonce?: bigint;
}
/**
 * Prepare a batch witness message
 */
declare function prepareBatchWitness(options: PrepareBatchWitnessOptions): BatchWitnessMessage;

/**
 * Sign a witness message using EIP-712
 */
declare function signWitness(account: LocalAccount | PrivateKeyAccount, domain: Eip712Domain, message: WitnessMessage): Promise<Hex>;
/**
 * Sign a witness message using wallet client
 */
declare function signWitnessWithWallet(walletClient: WalletClient, domain: Eip712Domain, message: WitnessMessage): Promise<Hex>;
/**
 * Sign a batch witness message
 */
declare function signBatchWitness(account: LocalAccount | PrivateKeyAccount, domain: Eip712Domain, message: BatchWitnessMessage): Promise<Hex>;

/**
 * Options for preparing authorization tuple
 */
interface PrepareAuthorizationOptions {
    /**
     * Chain ID (0 for any chain, or specific chain ID)
     */
    chainId: bigint | number;
    /**
     * Implementation contract address to delegate to
     */
    implementationAddress: Address;
    /**
     * Optional authorization nonce (auto-generated if not provided)
     */
    nonce?: bigint | number;
}
/**
 * Prepare an unsigned authorization tuple for EIP-7702
 */
declare function prepareAuthorization(options: PrepareAuthorizationOptions): UnsignedAuthorizationTuple;

/**
 * Sign an authorization tuple for EIP-7702
 * Computes: keccak256(0x05 || rlp([chain_id, address, nonce]))
 */
declare function signAuthorization(account: LocalAccount | PrivateKeyAccount, authorization: UnsignedAuthorizationTuple): Promise<AuthorizationTuple>;
/**
 * Verify an authorization signature
 */
declare function verifyAuthorizationSignature(authorization: AuthorizationTuple, expectedSigner: Hex): Promise<boolean>;

/**
 * Create a complete payment header for X-PAYMENT
 */
declare function createPaymentHeader(account: LocalAccount | PrivateKeyAccount, paymentDetails: PaymentDetails): Promise<string>;
/**
 * Create payment header using wallet client
 */
declare function createPaymentHeaderWithWallet(walletClient: WalletClient, paymentDetails: PaymentDetails): Promise<string>;

/**
 * Options for selecting payment details
 */
interface SelectPaymentDetailsOptions {
    /**
     * Preferred network (optional)
     */
    network?: SupportedNetwork;
    /**
     * Preferred scheme (optional)
     */
    scheme?: string;
    /**
     * Maximum amount willing to pay (optional)
     */
    maxAmount?: bigint;
}
/**
 * Select payment details from 402 response
 * Returns the first matching payment option, or the first available if no preferences match
 */
declare function selectPaymentDetails(response: PaymentRequiredResponse, options?: SelectPaymentDetailsOptions): PaymentDetails | null;
/**
 * Check if payment details are supported by this client
 */
declare function isPaymentDetailsSupported(details: PaymentDetails): boolean;

/**
 * Resource Server Helper for q402 Protocol
 *
 * Helper functions for resource servers implementing x402 payment flow
 */

/**
 * Standard x402 payment header format
 */
interface PaymentHeader {
    x402Version: number;
    scheme: string;
    network: string;
    payload: unknown;
}
/**
 * Standard x402 payment requirement format
 */
interface PaymentRequirement {
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: object;
}
/**
 * Create a 402 Payment Required response
 */
declare function createPaymentRequired(accepts: PaymentRequirement[], error?: string): PaymentRequiredResponse;
/**
 * Parse X-PAYMENT header
 */
declare function parsePaymentHeader(header: string): PaymentHeader;
/**
 * Create X-PAYMENT-RESPONSE header content
 */
declare function createPaymentResponse(success: boolean, options?: {
    error?: string;
    txHash?: string;
    networkId?: string;
    blockNumber?: string;
}): string;
/**
 * Validate payment header against requirements
 */
declare function validatePaymentHeader(header: PaymentHeader, requirement: PaymentRequirement): {
    isValid: boolean;
    reason?: string;
};
/**
 * Create payment requirement for EIP-7702 delegated payments
 */
declare function createEip7702PaymentRequirement(amount: string, tokenAddress: string, recipientAddress: string, resource: string, description: string, network?: string, mimeType?: string): PaymentRequirement;

export { FacilitatorClient, type FacilitatorSettlementResponse, type FacilitatorSupportedResponse, type FacilitatorVerificationResponse, type PaymentHeader, type PaymentRequirement, type PrepareAuthorizationOptions, type PrepareBatchWitnessOptions, type PrepareWitnessOptions, type SelectPaymentDetailsOptions, createEip7702PaymentRequirement, createFacilitatorClient, createPaymentHeader, createPaymentHeaderWithWallet, createPaymentRequired, createPaymentResponse, isPaymentDetailsSupported, parsePaymentHeader, prepareAuthorization, prepareBatchWitness, prepareWitness, selectPaymentDetails, settlePaymentWithFacilitator, signAuthorization, signBatchWitness, signWitness, signWitnessWithWallet, validatePaymentHeader, verifyAuthorizationSignature, verifyPaymentWithFacilitator };
