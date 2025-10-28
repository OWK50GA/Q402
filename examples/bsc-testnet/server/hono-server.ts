/**
 * Hono server example
 * 
 * Demonstrates how to integrate x402 BNB middleware with Hono
 */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import { createX402BnbMiddleware } from "@x402-bnb/middleware-hono";
import { SupportedNetworks } from "@x402-bnb/core";

async function main() {
  const app = new Hono();
  const port = parseInt(process.env.PORT || "3000", 10);

  // Create sponsor wallet client
  const sponsorKey = process.env.SPONSOR_PRIVATE_KEY as `0x${string}`;
  if (!sponsorKey) {
    console.error("SPONSOR_PRIVATE_KEY environment variable is required");
    process.exit(1);
  }

  const sponsorAccount = privateKeyToAccount(sponsorKey);
  const walletClient = createWalletClient({
    account: sponsorAccount,
    chain: bscTestnet,
    transport: http(process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545"),
  });

  console.log(`Sponsor account: ${sponsorAccount.address}`);

  // Configure x402 BNB middleware
  const recipientAddress = process.env.RECIPIENT_ADDRESS as `0x${string}`;
  const implementationContract = process.env.IMPLEMENTATION_CONTRACT as `0x${string}`;
  const verifyingContract = process.env.VERIFYING_CONTRACT as `0x${string}`;

  if (!recipientAddress || !implementationContract || !verifyingContract) {
    console.error(
      "Required environment variables: RECIPIENT_ADDRESS, IMPLEMENTATION_CONTRACT, VERIFYING_CONTRACT",
    );
    process.exit(1);
  }

  const paymentMiddleware = createX402BnbMiddleware({
    network: SupportedNetworks.BSC_TESTNET,
    recipientAddress,
    implementationContract,
    verifyingContract,
    walletClient,
    endpoints: [
      {
        path: "/api/premium-data",
        amount: "1000000", // 1 USDT
        token: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
        description: "Access to premium data",
        mimeType: "application/json",
      },
      {
        path: "/api/ai-analysis",
        amount: "5000000", // 5 USDT
        token: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
        description: "AI-powered analysis",
        mimeType: "application/json",
      },
    ],
    autoSettle: true,
  });

  // Apply middleware globally
  app.use("*", paymentMiddleware);

  // Public routes
  app.get("/", (c) => {
    return c.json({
      name: "x402 BNB Hono Example Server",
      endpoints: {
        public: ["/", "/health"],
        protected: ["/api/premium-data", "/api/ai-analysis"],
      },
    });
  });

  app.get("/health", (c) => {
    return c.json({ status: "ok" });
  });

  // Protected routes
  app.get("/api/premium-data", (c) => {
    const payment = c.get("payment");

    return c.json({
      message: "Premium data access granted",
      data: {
        timestamp: Date.now(),
        premium: true,
        marketData: {
          btc: 95000,
          eth: 3500,
          bnb: 650,
        },
        payer: payment?.payer,
      },
    });
  });

  app.get("/api/ai-analysis", (c) => {
    const payment = c.get("payment");

    return c.json({
      message: "AI analysis complete",
      analysis: {
        sentiment: "bullish",
        score: 95,
        confidence: 0.98,
        recommendations: [
          "Consider increasing position in BTC",
          "Watch for support levels on ETH",
          "BNB showing strong momentum",
        ],
        timestamp: Date.now(),
        payer: payment?.payer,
      },
    });
  });

  // Start server
  console.log(`Starting Hono server on port ${port}...`);
  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Try accessing protected endpoints!`);
}

main().catch(console.error);

