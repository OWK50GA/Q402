/**
 * Simple payment example
 * 
 * Demonstrates how to:
 * 1. Fetch payment details from a 402 response
 * 2. Create and sign a payment
 * 3. Send the payment to the resource server
 */

import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import {
  createPaymentHeader,
  selectPaymentDetails,
  SupportedNetworks,
  type PaymentRequiredResponse,
} from "@q402/core";

async function main() {
  // Check for private key
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.error("PRIVATE_KEY environment variable is required");
    process.exit(1);
  }

  // Create account and wallet client
  const account = privateKeyToAccount(privateKey);
  console.log(`Using account: ${account.address}`);

  // Simulate fetching 402 response from server
  const mock402Response: PaymentRequiredResponse = {
    x402Version: 1,
    accepts: [
      {
        scheme: "evm/eip7702-delegated-payment",
        networkId: SupportedNetworks.BSC_TESTNET,
        token: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // USDT on BSC testnet
        amount: "1000000", // 1 USDT (6 decimals)
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9", // Example recipient
        implementationContract: "0x0000000000000000000000000000000000000000", // TODO: Deploy
        witness: {
          domain: {
            name: "x402 BNB",
            version: "1",
            chainId: 97,
            verifyingContract: "0x0000000000000000000000000000000000000000",
          },
          types: {
            Witness: [
              { name: "owner", type: "address" },
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "to", type: "address" },
              { name: "deadline", type: "uint256" },
              { name: "paymentId", type: "bytes32" },
              { name: "nonce", type: "uint256" },
            ],
          },
          primaryType: "Witness",
          message: {
            owner: account.address,
            token: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
            amount: BigInt("1000000"),
            to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9",
            deadline: BigInt(Math.floor(Date.now() / 1000) + 900),
            paymentId: "0x0000000000000000000000000000000000000000000000000000000000000000",
            nonce: BigInt(0),
          },
        },
        authorization: {
          chainId: 97,
          address: "0x0000000000000000000000000000000000000000",
          nonce: 0,
        },
      },
    ],
  };

  // Select payment details
  const paymentDetails = selectPaymentDetails(mock402Response, {
    network: SupportedNetworks.BSC_TESTNET,
  });

  if (!paymentDetails) {
    console.error("No suitable payment method found");
    process.exit(1);
  }

  console.log("\nPayment Details:");
  console.log(`Network: ${paymentDetails.networkId}`);
  console.log(`Token: ${paymentDetails.token}`);
  console.log(`Amount: ${paymentDetails.amount}`);
  console.log(`Recipient: ${paymentDetails.to}`);

  // Create payment header
  console.log("\nCreating payment header...");
  try {
    const paymentHeader = await createPaymentHeader(account, paymentDetails);
    console.log("Payment header created successfully!");
    console.log(`Header length: ${paymentHeader.length} bytes`);

    // In a real scenario, you would now make an HTTP request with this header:
    // fetch('https://api.example.com/resource', {
    //   headers: {
    //     'X-PAYMENT': paymentHeader
    //   }
    // })

    console.log("\nPayment ready to send!");
    console.log("Use this header in your HTTP request:");
    console.log(`X-PAYMENT: ${paymentHeader.substring(0, 50)}...`);
  } catch (error) {
    console.error("Error creating payment:", error);
    process.exit(1);
  }
}

main().catch(console.error);

