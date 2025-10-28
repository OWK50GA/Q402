/**
 * Utility functions for client examples
 */

import type { Address } from "viem";

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  
  if (remainder === 0n) {
    return whole.toString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, "0");
  return `${whole}.${remainderStr}`;
}

/**
 * Parse token amount from string
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = "0"] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFraction);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, network: "mainnet" | "testnet" = "testnet"): string {
  const baseUrl = network === "mainnet"
    ? "https://bscscan.com"
    : "https://testnet.bscscan.com";
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(address: Address, network: "mainnet" | "testnet" = "testnet"): string {
  const baseUrl = network === "mainnet"
    ? "https://bscscan.com"
    : "https://testnet.bscscan.com";
  return `${baseUrl}/address/${address}`;
}

