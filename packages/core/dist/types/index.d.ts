import { b as SupportedNetwork } from '../payment-B_z5dGJY.js';
export { d as AuthorizationSignature, A as AuthorizationTuple, j as BatchPaymentDetails, B as BatchWitnessMessage, f as BatchWitnessTypedData, E as Eip712Domain, N as NetworkConfig, c as NetworkConfigs, i as PaymentDetails, l as PaymentExecutionResponse, P as PaymentItem, k as PaymentRequiredResponse, g as PaymentScheme, h as PaymentSchemeType, S as SignedPaymentPayload, a as SupportedNetworks, U as UnsignedAuthorizationTuple, W as WitnessMessage, e as WitnessTypedData } from '../payment-B_z5dGJY.js';
import { z } from 'zod';
import { Hex } from 'viem';

/**
 * Address validation schema (Ethereum address)
 */
declare const AddressSchema: z.ZodString;
/**
 * Hex string validation schema
 */
declare const HexSchema: z.ZodString;
/**
 * BigInt string schema
 */
declare const BigIntStringSchema: z.ZodString;
/**
 * Network schema
 */
declare const NetworkSchema: z.ZodEnum<[SupportedNetwork, ...SupportedNetwork[]]>;
/**
 * Payment scheme schema
 */
declare const PaymentSchemeSchema: z.ZodEnum<["evm/eip7702-delegated-payment", "evm/eip7702-delegated-batch"]>;
/**
 * EIP-712 domain schema
 */
declare const Eip712DomainSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    chainId: z.ZodNumber;
    verifyingContract: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    chainId: number;
    verifyingContract: string;
    version?: string | undefined;
}, {
    name: string;
    chainId: number;
    verifyingContract: string;
    version?: string | undefined;
}>;
/**
 * Witness message schema
 */
declare const WitnessMessageSchema: z.ZodObject<{
    owner: z.ZodString;
    token: z.ZodString;
    amount: z.ZodString;
    to: z.ZodString;
    deadline: z.ZodString;
    paymentId: z.ZodString;
    nonce: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    amount: string;
    to: string;
    owner: string;
    deadline: string;
    paymentId: string;
    nonce: string;
}, {
    token: string;
    amount: string;
    to: string;
    owner: string;
    deadline: string;
    paymentId: string;
    nonce: string;
}>;
/**
 * Payment item schema
 */
declare const PaymentItemSchema: z.ZodObject<{
    token: z.ZodString;
    amount: z.ZodString;
    to: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    amount: string;
    to: string;
}, {
    token: string;
    amount: string;
    to: string;
}>;
/**
 * Batch witness message schema
 */
declare const BatchWitnessMessageSchema: z.ZodObject<{
    owner: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        token: z.ZodString;
        amount: z.ZodString;
        to: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        token: string;
        amount: string;
        to: string;
    }, {
        token: string;
        amount: string;
        to: string;
    }>, "many">;
    deadline: z.ZodString;
    paymentId: z.ZodString;
    nonce: z.ZodString;
}, "strip", z.ZodTypeAny, {
    owner: string;
    deadline: string;
    paymentId: string;
    nonce: string;
    items: {
        token: string;
        amount: string;
        to: string;
    }[];
}, {
    owner: string;
    deadline: string;
    paymentId: string;
    nonce: string;
    items: {
        token: string;
        amount: string;
        to: string;
    }[];
}>;
/**
 * Authorization tuple schema
 */
declare const AuthorizationTupleSchema: z.ZodObject<{
    chainId: z.ZodNumber;
    address: z.ZodString;
    nonce: z.ZodNumber;
    yParity: z.ZodNumber;
    r: z.ZodString;
    s: z.ZodString;
}, "strip", z.ZodTypeAny, {
    chainId: number;
    nonce: number;
    address: string;
    yParity: number;
    r: string;
    s: string;
}, {
    chainId: number;
    nonce: number;
    address: string;
    yParity: number;
    r: string;
    s: string;
}>;
/**
 * Payment details schema
 */
declare const PaymentDetailsSchema: z.ZodObject<{
    scheme: z.ZodEnum<["evm/eip7702-delegated-payment", "evm/eip7702-delegated-batch"]>;
    networkId: z.ZodEnum<[SupportedNetwork, ...SupportedNetwork[]]>;
    token: z.ZodString;
    amount: z.ZodString;
    to: z.ZodString;
    implementationContract: z.ZodString;
    witness: z.ZodRecord<z.ZodString, z.ZodAny>;
    authorization: z.ZodObject<{
        chainId: z.ZodNumber;
        address: z.ZodString;
        nonce: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        chainId: number;
        nonce: number;
        address: string;
    }, {
        chainId: number;
        nonce: number;
        address: string;
    }>;
}, "strip", z.ZodTypeAny, {
    token: string;
    amount: string;
    witness: Record<string, any>;
    scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
    networkId: SupportedNetwork;
    to: string;
    implementationContract: string;
    authorization: {
        chainId: number;
        nonce: number;
        address: string;
    };
}, {
    token: string;
    amount: string;
    witness: Record<string, any>;
    scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
    networkId: SupportedNetwork;
    to: string;
    implementationContract: string;
    authorization: {
        chainId: number;
        nonce: number;
        address: string;
    };
}>;
/**
 * Payment required response schema
 */
declare const PaymentRequiredResponseSchema: z.ZodObject<{
    x402Version: z.ZodNumber;
    accepts: z.ZodArray<z.ZodObject<{
        scheme: z.ZodEnum<["evm/eip7702-delegated-payment", "evm/eip7702-delegated-batch"]>;
        networkId: z.ZodEnum<[SupportedNetwork, ...SupportedNetwork[]]>;
        token: z.ZodString;
        amount: z.ZodString;
        to: z.ZodString;
        implementationContract: z.ZodString;
        witness: z.ZodRecord<z.ZodString, z.ZodAny>;
        authorization: z.ZodObject<{
            chainId: z.ZodNumber;
            address: z.ZodString;
            nonce: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            chainId: number;
            nonce: number;
            address: string;
        }, {
            chainId: number;
            nonce: number;
            address: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        token: string;
        amount: string;
        witness: Record<string, any>;
        scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
        networkId: SupportedNetwork;
        to: string;
        implementationContract: string;
        authorization: {
            chainId: number;
            nonce: number;
            address: string;
        };
    }, {
        token: string;
        amount: string;
        witness: Record<string, any>;
        scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
        networkId: SupportedNetwork;
        to: string;
        implementationContract: string;
        authorization: {
            chainId: number;
            nonce: number;
            address: string;
        };
    }>, "many">;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    x402Version: number;
    accepts: {
        token: string;
        amount: string;
        witness: Record<string, any>;
        scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
        networkId: SupportedNetwork;
        to: string;
        implementationContract: string;
        authorization: {
            chainId: number;
            nonce: number;
            address: string;
        };
    }[];
    error?: string | undefined;
}, {
    x402Version: number;
    accepts: {
        token: string;
        amount: string;
        witness: Record<string, any>;
        scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
        networkId: SupportedNetwork;
        to: string;
        implementationContract: string;
        authorization: {
            chainId: number;
            nonce: number;
            address: string;
        };
    }[];
    error?: string | undefined;
}>;
/**
 * Signed payment payload schema
 */
declare const SignedPaymentPayloadSchema: z.ZodObject<{
    witnessSignature: z.ZodString;
    authorization: z.ZodObject<{
        chainId: z.ZodNumber;
        address: z.ZodString;
        nonce: z.ZodNumber;
        yParity: z.ZodNumber;
        r: z.ZodString;
        s: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        chainId: number;
        nonce: number;
        address: string;
        yParity: number;
        r: string;
        s: string;
    }, {
        chainId: number;
        nonce: number;
        address: string;
        yParity: number;
        r: string;
        s: string;
    }>;
    paymentDetails: z.ZodObject<{
        scheme: z.ZodEnum<["evm/eip7702-delegated-payment", "evm/eip7702-delegated-batch"]>;
        networkId: z.ZodEnum<[SupportedNetwork, ...SupportedNetwork[]]>;
        token: z.ZodString;
        amount: z.ZodString;
        to: z.ZodString;
        implementationContract: z.ZodString;
        witness: z.ZodRecord<z.ZodString, z.ZodAny>;
        authorization: z.ZodObject<{
            chainId: z.ZodNumber;
            address: z.ZodString;
            nonce: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            chainId: number;
            nonce: number;
            address: string;
        }, {
            chainId: number;
            nonce: number;
            address: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        token: string;
        amount: string;
        witness: Record<string, any>;
        scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
        networkId: SupportedNetwork;
        to: string;
        implementationContract: string;
        authorization: {
            chainId: number;
            nonce: number;
            address: string;
        };
    }, {
        token: string;
        amount: string;
        witness: Record<string, any>;
        scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
        networkId: SupportedNetwork;
        to: string;
        implementationContract: string;
        authorization: {
            chainId: number;
            nonce: number;
            address: string;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    authorization: {
        chainId: number;
        nonce: number;
        address: string;
        yParity: number;
        r: string;
        s: string;
    };
    witnessSignature: string;
    paymentDetails: {
        token: string;
        amount: string;
        witness: Record<string, any>;
        scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
        networkId: SupportedNetwork;
        to: string;
        implementationContract: string;
        authorization: {
            chainId: number;
            nonce: number;
            address: string;
        };
    };
}, {
    authorization: {
        chainId: number;
        nonce: number;
        address: string;
        yParity: number;
        r: string;
        s: string;
    };
    witnessSignature: string;
    paymentDetails: {
        token: string;
        amount: string;
        witness: Record<string, any>;
        scheme: "evm/eip7702-delegated-payment" | "evm/eip7702-delegated-batch";
        networkId: SupportedNetwork;
        to: string;
        implementationContract: string;
        authorization: {
            chainId: number;
            nonce: number;
            address: string;
        };
    };
}>;

/**
 * Verification result
 */
interface VerificationResult {
    /**
     * Whether the payment is valid
     */
    isValid: boolean;
    /**
     * Reason for invalidity
     */
    invalidReason?: string;
    /**
     * Recovered payer address
     */
    payer?: string;
    /**
     * Additional validation details
     */
    details?: {
        witnessValid: boolean;
        authorizationValid: boolean;
        amountValid: boolean;
        deadlineValid: boolean;
        recipientValid: boolean;
    };
}
/**
 * Settlement result
 */
interface SettlementResult {
    /**
     * Whether settlement was successful
     */
    success: boolean;
    /**
     * Transaction hash if successful
     */
    txHash?: Hex;
    /**
     * Error message if failed
     */
    error?: string;
    /**
     * Block number
     */
    blockNumber?: bigint;
}
/**
 * Error reasons for payment validation
 */
declare const ErrorReason: {
    readonly INSUFFICIENT_FUNDS: "insufficient_funds";
    readonly INVALID_SIGNATURE: "invalid_signature";
    readonly INVALID_AUTHORIZATION: "invalid_authorization";
    readonly INVALID_AMOUNT: "invalid_amount";
    readonly INVALID_RECIPIENT: "invalid_recipient";
    readonly PAYMENT_EXPIRED: "payment_expired";
    readonly NONCE_REUSED: "nonce_reused";
    readonly INVALID_IMPLEMENTATION: "invalid_implementation";
    readonly INVALID_NETWORK: "invalid_network";
    readonly INVALID_SCHEME: "invalid_scheme";
    readonly UNEXPECTED_ERROR: "unexpected_error";
};
type ErrorReasonType = (typeof ErrorReason)[keyof typeof ErrorReason];

export { AddressSchema, AuthorizationTupleSchema, BatchWitnessMessageSchema, BigIntStringSchema, Eip712DomainSchema, ErrorReason, type ErrorReasonType, HexSchema, NetworkSchema, PaymentDetailsSchema, PaymentItemSchema, PaymentRequiredResponseSchema, PaymentSchemeSchema, type SettlementResult, SignedPaymentPayloadSchema, SupportedNetwork, type VerificationResult, WitnessMessageSchema };
