import { Address, Hex } from 'viem';

/**
 * Supported EVM networks for q402 protocol
 */
declare const SupportedNetworks: {
    readonly BSC_MAINNET: "bsc-mainnet";
    readonly BSC_TESTNET: "bsc-testnet";
};
type SupportedNetwork = (typeof SupportedNetworks)[keyof typeof SupportedNetworks];
/**
 * Network configuration for different chains
 */
interface NetworkConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    explorer: string;
}
/**
 * Network configurations
 */
declare const NetworkConfigs: Record<SupportedNetwork, NetworkConfig>;

/**
 * EIP-7702 authorization tuple structure
 * Used to delegate code execution to an implementation contract
 */
interface AuthorizationTuple {
    /**
     * Chain ID (0 for any chain, or specific chain ID like 56 for BSC)
     */
    chainId: bigint;
    /**
     * Address of the implementation contract to delegate to
     */
    address: Address;
    /**
     * Authorization nonce (uint64)
     */
    nonce: bigint;
    /**
     * Signature y_parity (0 or 1)
     */
    yParity: number;
    /**
     * Signature r component
     */
    r: Hex;
    /**
     * Signature s component
     */
    s: Hex;
}
/**
 * Unsigned authorization tuple before signing
 */
interface UnsignedAuthorizationTuple {
    chainId: bigint;
    address: Address;
    nonce: bigint;
}
/**
 * Authorization signature components
 */
interface AuthorizationSignature {
    yParity: number;
    r: Hex;
    s: Hex;
}

/**
 * EIP-712 domain for q402 witness signatures
 */
interface Eip712Domain {
    name: string;
    version?: string;
    chainId: number;
    verifyingContract: Address;
}
/**
 * Witness message for single payment
 */
interface WitnessMessage {
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
    amount: bigint;
    /**
     * Recipient address
     */
    to: Address;
    /**
     * Deadline timestamp (unix seconds)
     */
    deadline: bigint;
    /**
     * Unique payment identifier
     */
    paymentId: Hex;
    /**
     * Application-level nonce
     */
    nonce: bigint;
}
/**
 * Single payment item for batch payments
 */
interface PaymentItem {
    token: Address;
    amount: bigint;
    to: Address;
}
/**
 * Witness message for batch payments
 */
interface BatchWitnessMessage {
    owner: Address;
    items: PaymentItem[];
    deadline: bigint;
    paymentId: Hex;
    nonce: bigint;
}
/**
 * EIP-712 typed data for witness signing
 */
interface WitnessTypedData {
    domain: Eip712Domain;
    types: {
        Witness: Array<{
            name: string;
            type: string;
        }>;
    };
    primaryType: "Witness";
    message: WitnessMessage;
}
/**
 * EIP-712 typed data for batch witness signing
 */
interface BatchWitnessTypedData {
    domain: Eip712Domain;
    types: {
        BatchWitness: Array<{
            name: string;
            type: string;
        }>;
        PaymentItem: Array<{
            name: string;
            type: string;
        }>;
    };
    primaryType: "BatchWitness";
    message: BatchWitnessMessage;
}

/**
 * Payment scheme identifier
 */
declare const PaymentScheme: {
    readonly EIP7702_DELEGATED: "evm/eip7702-delegated-payment";
    readonly EIP7702_DELEGATED_BATCH: "evm/eip7702-delegated-batch";
};
type PaymentSchemeType = (typeof PaymentScheme)[keyof typeof PaymentScheme];
/**
 * Payment details returned by resource server in 402 response
 */
interface PaymentDetails {
    /**
     * Payment scheme identifier
     */
    scheme: PaymentSchemeType;
    /**
     * Network identifier
     */
    networkId: SupportedNetwork;
    /**
     * Token contract address
     */
    token: Address;
    /**
     * Payment amount in atomic units
     */
    amount: string;
    /**
     * Recipient address (resource server settlement wallet)
     */
    to: Address;
    /**
     * Implementation contract address (whitelisted delegation target)
     */
    implementationContract: Address;
    /**
     * EIP-712 witness typed data
     */
    witness: WitnessTypedData | BatchWitnessTypedData;
    /**
     * Authorization tuple template (without signature)
     */
    authorization: {
        chainId: number;
        address: Address;
        nonce: number;
    };
}
/**
 * Batch payment details
 */
interface BatchPaymentDetails extends Omit<PaymentDetails, "token" | "amount" | "witness"> {
    scheme: typeof PaymentScheme.EIP7702_DELEGATED_BATCH;
    items: PaymentItem[];
    witness: BatchWitnessTypedData;
}
/**
 * Signed payment payload for X-PAYMENT header
 */
interface SignedPaymentPayload {
    /**
     * Witness signature (EIP-712)
     */
    witnessSignature: Hex;
    /**
     * Signed authorization tuple (EIP-7702)
     */
    authorization: AuthorizationTuple;
    /**
     * Payment details
     */
    paymentDetails: PaymentDetails | BatchPaymentDetails;
}
/**
 * 402 Payment Required response
 */
interface PaymentRequiredResponse {
    /**
     * Protocol version
     */
    x402Version: number;
    /**
     * Accepted payment methods
     */
    accepts: PaymentDetails[];
    /**
     * Optional error message
     */
    error?: string;
}
/**
 * Payment execution response
 */
interface PaymentExecutionResponse {
    /**
     * Transaction hash
     */
    txHash: Hex;
    /**
     * Block number
     */
    blockNumber?: bigint;
    /**
     * Transaction status
     */
    status: "pending" | "confirmed" | "failed";
    /**
     * Transfer events or receipts
     */
    transfers?: Array<{
        token: Address;
        from: Address;
        to: Address;
        amount: bigint;
    }>;
    /**
     * Error message if failed
     */
    error?: string;
}

export { type AuthorizationTuple as A, type BatchWitnessMessage as B, type Eip712Domain as E, type NetworkConfig as N, type PaymentItem as P, type SignedPaymentPayload as S, type UnsignedAuthorizationTuple as U, type WitnessMessage as W, SupportedNetworks as a, type SupportedNetwork as b, NetworkConfigs as c, type AuthorizationSignature as d, type WitnessTypedData as e, type BatchWitnessTypedData as f, PaymentScheme as g, type PaymentSchemeType as h, type PaymentDetails as i, type BatchPaymentDetails as j, type PaymentRequiredResponse as k, type PaymentExecutionResponse as l };
