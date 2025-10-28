/**
 * Batch payment example
 * 
 * Demonstrates how to create a batch payment with multiple recipients
 */

import { privateKeyToAccount } from "viem/accounts";
import {
  prepareBatchWitness,
  signBatchWitness,
  prepareAuthorization,
  signAuthorization,
  SupportedNetworks,
  type Eip712Domain,
  type PaymentItem,
} from "@x402-bnb/core";

async function main() {
  // Check for private key
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.error("PRIVATE_KEY environment variable is required");
    process.exit(1);
  }

  // Create account
  const account = privateKeyToAccount(privateKey);
  console.log(`Using account: ${account.address}`);

  // Define batch payment items
  const items: PaymentItem[] = [
    {
      token: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // USDT on BSC testnet
      amount: BigInt("500000"), // 0.5 USDT
      to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9", // Recipient 1
    },
    {
      token: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // USDT
      amount: BigInt("300000"), // 0.3 USDT
      to: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", // Recipient 2
    },
    {
      token: "0x64544969ed7EBf5f083679233325356EbE738930", // USDC on BSC testnet
      amount: BigInt("200000"), // 0.2 USDC
      to: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", // Recipient 3
    },
  ];

  console.log("\nBatch Payment Items:");
  items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.amount.toString()} of ${item.token} to ${item.to}`);
  });

  // Prepare batch witness
  const batchWitness = prepareBatchWitness({
    owner: account.address,
    items,
  });

  console.log("\nBatch Witness:");
  console.log(`  Owner: ${batchWitness.owner}`);
  console.log(`  Items count: ${batchWitness.items.length}`);
  console.log(`  Deadline: ${new Date(Number(batchWitness.deadline) * 1000).toISOString()}`);
  console.log(`  Payment ID: ${batchWitness.paymentId}`);
  console.log(`  Nonce: ${batchWitness.nonce}`);

  // Define EIP-712 domain
  const domain: Eip712Domain = {
    name: "x402 BNB",
    version: "1",
    chainId: 97, // BSC testnet
    verifyingContract: "0x0000000000000000000000000000000000000000", // TODO: Deploy
  };

  // Sign batch witness
  console.log("\nSigning batch witness...");
  try {
    const witnessSignature = await signBatchWitness(account, domain, batchWitness);
    console.log("Batch witness signed successfully!");
    console.log(`Signature: ${witnessSignature.substring(0, 20)}...`);

    // Prepare and sign authorization
    const unsignedAuth = prepareAuthorization({
      chainId: 97,
      implementationAddress: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    });

    const signedAuth = await signAuthorization(account, unsignedAuth);
    console.log("\nAuthorization signed successfully!");

    console.log("\nBatch Payment Summary:");
    console.log(`  Total items: ${items.length}`);
    console.log(`  Unique tokens: ${new Set(items.map((i) => i.token)).size}`);
    console.log(`  Unique recipients: ${new Set(items.map((i) => i.to)).size}`);
    console.log(`  Total USDT: ${items.filter(i => i.token === "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd").reduce((sum, i) => sum + i.amount, 0n)}`);

    console.log("\nBatch payment ready to send!");
    console.log("Combine witness signature and authorization into X-PAYMENT header");
  } catch (error) {
    console.error("Error creating batch payment:", error);
    process.exit(1);
  }
}

main().catch(console.error);

