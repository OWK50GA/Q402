import { Request, Response, NextFunction } from 'express';
import { Address, WalletClient } from 'viem';
import { SupportedNetwork, PaymentRequiredResponse } from '@q402/core';

/**
 * Payment endpoint configuration
 */
interface PaymentEndpointConfig {
    /**
     * Endpoint path (e.g., "/api/data")
     */
    path: string;
    /**
     * Payment amount in atomic units
     */
    amount: string;
    /**
     * Token contract address
     */
    token: Address;
    /**
     * Resource description
     */
    description: string;
    /**
     * Response MIME type
     */
    mimeType?: string;
}
/**
 * Middleware configuration
 */
interface Q402MiddlewareConfig {
    /**
     * Network to use
     */
    network: SupportedNetwork;
    /**
     * Recipient address (where payments go)
     */
    recipientAddress: Address;
    /**
     * Implementation contract address
     */
    implementationContract: Address;
    /**
     * Verifying contract address (for EIP-712 domain)
     */
    verifyingContract: Address;
    /**
     * Wallet client for settlement (sponsor)
     */
    walletClient: WalletClient;
    /**
     * Payment endpoints configuration
     */
    endpoints: PaymentEndpointConfig[];
    /**
     * Auto-settle payments (default: true)
     */
    autoSettle?: boolean;
    /**
     * Timeout for payment verification (ms)
     */
    verificationTimeout?: number;
}

/**
 * Create q402 payment middleware for Express
 */
declare function createQ402Middleware(config: Q402MiddlewareConfig): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Extend Express Request type to include payment info
 */
declare global {
    namespace Express {
        interface Request {
            payment?: {
                verified: boolean;
                payer: string;
                amount: string;
                token: string;
            };
        }
    }
}

/**
 * Create 402 Payment Required response
 */
declare function create402Response(config: Q402MiddlewareConfig, endpoint: PaymentEndpointConfig, _req: Request): PaymentRequiredResponse;
/**
 * Send 402 Payment Required response
 */
declare function send402Response(res: Response, config: Q402MiddlewareConfig, endpoint: PaymentEndpointConfig, req: Request): void;

export { type PaymentEndpointConfig, type Q402MiddlewareConfig, create402Response, createQ402Middleware, send402Response };
