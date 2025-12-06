import { S as SignedPaymentPayload } from './payment-B_z5dGJY.mjs';
export { d as AuthorizationSignature, A as AuthorizationTuple, j as BatchPaymentDetails, B as BatchWitnessMessage, f as BatchWitnessTypedData, E as Eip712Domain, N as NetworkConfig, c as NetworkConfigs, i as PaymentDetails, l as PaymentExecutionResponse, P as PaymentItem, k as PaymentRequiredResponse, g as PaymentScheme, h as PaymentSchemeType, b as SupportedNetwork, a as SupportedNetworks, U as UnsignedAuthorizationTuple, W as WitnessMessage, e as WitnessTypedData } from './payment-B_z5dGJY.mjs';
import { VerificationResult, SettlementResult } from './types/index.mjs';
export { AddressSchema, AuthorizationTupleSchema, BatchWitnessMessageSchema, BigIntStringSchema, Eip712DomainSchema, ErrorReason, ErrorReasonType, HexSchema, NetworkSchema, PaymentDetailsSchema, PaymentItemSchema, PaymentRequiredResponseSchema, PaymentSchemeSchema, SignedPaymentPayloadSchema, WitnessMessageSchema } from './types/index.mjs';
export { FacilitatorClient, FacilitatorSettlementResponse, FacilitatorSupportedResponse, FacilitatorVerificationResponse, PaymentHeader, PaymentRequirement, PrepareAuthorizationOptions, PrepareBatchWitnessOptions, PrepareWitnessOptions, SelectPaymentDetailsOptions, createEip7702PaymentRequirement, createFacilitatorClient, createPaymentHeader, createPaymentHeaderWithWallet, createPaymentRequired, createPaymentResponse, isPaymentDetailsSupported, parsePaymentHeader, prepareAuthorization, prepareBatchWitness, prepareWitness, selectPaymentDetails, settlePaymentWithFacilitator, signAuthorization, signBatchWitness, signWitness, signWitnessWithWallet, validatePaymentHeader, verifyAuthorizationSignature, verifyPaymentWithFacilitator } from './client/index.mjs';
import { Hex, Address, WalletClient } from 'viem';
import 'zod';

/**
 * ABI for EIP-7702 delegated payment implementation contract
 */
declare const PaymentImplementationAbi: readonly [{
    readonly type: "function";
    readonly name: "pay";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
    }, {
        readonly name: "paymentId";
        readonly type: "bytes32";
    }, {
        readonly name: "witnessSig";
        readonly type: "bytes";
    }];
    readonly outputs: readonly [];
}, {
    readonly type: "function";
    readonly name: "payBatch";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly name: "items";
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly name: "to";
            readonly type: "address";
        }];
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
    }, {
        readonly name: "paymentId";
        readonly type: "bytes32";
    }, {
        readonly name: "witnessSig";
        readonly type: "bytes";
    }];
    readonly outputs: readonly [];
}, {
    readonly type: "event";
    readonly name: "Payment";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "paymentId";
        readonly type: "bytes32";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "BatchPayment";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "paymentId";
        readonly type: "bytes32";
        readonly indexed: false;
    }, {
        readonly name: "itemCount";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];
/**
 * Standard ERC-20 ABI (minimal)
 */
declare const Erc20Abi: readonly [{
    readonly type: "function";
    readonly name: "balanceOf";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "transfer";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
}, {
    readonly type: "function";
    readonly name: "allowance";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly type: "event";
    readonly name: "Transfer";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];

/**
 * Base error class for q402 errors
 */
declare class Q402Error extends Error {
    readonly code: string;
    readonly details?: unknown | undefined;
    constructor(message: string, code: string, details?: unknown | undefined);
}
/**
 * Payment validation error
 */
declare class PaymentValidationError extends Q402Error {
    constructor(message: string, details?: unknown);
}
/**
 * Signature error
 */
declare class SignatureError extends Q402Error {
    constructor(message: string, details?: unknown);
}
/**
 * Network error
 */
declare class NetworkError extends Q402Error {
    constructor(message: string, details?: unknown);
}
/**
 * Transaction error
 */
declare class TransactionError extends Q402Error {
    constructor(message: string, details?: unknown);
}

/**
 * Generate a random nonce for payment
 * Uses cryptographically secure random bytes
 */
declare function generateNonce(): bigint;
/**
 * Generate a payment ID (32-byte hex string)
 */
declare function generatePaymentId(): `0x${string}`;
/**
 * Generate an authorization nonce (uint64)
 */
declare function generateAuthNonce(): bigint;

/**
 * Encode data to base64 string
 */
declare function encodeBase64(data: string | object): string;
/**
 * Decode base64 string to object
 */
declare function decodeBase64<T = unknown>(encoded: string): T;
/**
 * RLP encode authorization tuple for EIP-7702
 * Format: rlp([chain_id, address, nonce])
 */
declare function rlpEncodeAuthorization(chainId: bigint, address: Hex, nonce: bigint): Uint8Array;

/**
 * Validate Ethereum address
 */
declare function validateAddress(address: unknown): address is Address;
/**
 * Validate hex string
 */
declare function validateHex(value: unknown): value is Hex;
/**
 * Validate bigint or bigint string
 */
declare function validateBigInt(value: unknown): boolean;
/**
 * Validate deadline (must be in the future)
 */
declare function validateDeadline(deadline: bigint): boolean;
/**
 * Validate amount (must be positive)
 */
declare function validateAmount(amount: bigint): boolean;
/**
 * Parse bigint from string or bigint
 */
declare function parseBigInt(value: string | bigint): bigint;

/**
 * Payment verification logic for facilitator services
 * (Migrated from facilitator package)
 */

/**
 * Core payment verification function
 *
 * This function validates:
 * 1. Basic payload validation
 * 2. Deadline checks
 * 3. Signature format validation
 * 4. Authorization format validation
 * 5. Payment parameters validation
 */
declare function verifyPayment(payload: SignedPaymentPayload): Promise<VerificationResult>;

/**
 * Payment settlement logic for facilitator services
 * (Core settlement function that facilitator services use)
 */

/**
 * Settle a verified payment by executing EIP-7702 transaction on-chain
 *
 * This is the core settlement function that facilitator services call.
 * Note: This is a simplified implementation for testing purposes.
 */
declare function settlePayment(_walletClient: WalletClient, _payload: SignedPaymentPayload): Promise<SettlementResult>;

/**
 * q402 - EIP-7702 Delegated Payment Protocol
 *
 * A production-ready EIP-7702 delegated execution payment flow for BSC and EVM networks,
 * with gas sponsored by facilitators.
 *
 * Inspired by the x402 protocol: https://github.com/coinbase/x402
 *
 * @packageDocumentation
 */

/**
 * Protocol version
 */
declare const X402_BNB_VERSION = 1;

export { Erc20Abi, NetworkError, PaymentImplementationAbi, PaymentValidationError, Q402Error, SettlementResult, SignatureError, SignedPaymentPayload, TransactionError, VerificationResult, X402_BNB_VERSION, decodeBase64, encodeBase64, generateAuthNonce, generateNonce, generatePaymentId, parseBigInt, rlpEncodeAuthorization, settlePayment, validateAddress, validateAmount, validateBigInt, validateDeadline, validateHex, verifyPayment };
