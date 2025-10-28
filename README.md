# x402 BNB -  Delegated Payment Protocol

A production-ready, gasless payment protocol for BSC and EVM networks using EIP-7702 delegated execution. Built to enhance project influence and governance execution for Quack AI ecosystem.

**Inspired by the [x402 protocol](https://github.com/coinbase/x402)** - we extend the vision with EIP-7702's power.

## What is x402 BNB?

x402 BNB uses EIP-7702's "user context push" to replace traditional ERC-20 allowance "pull" flow:

- **Users sign offline**: One EIP-7702 authorization tuple + one EIP-712 payment witness
- **Facilitator sponsors gas**: Submits type 0x04 (set-code) transaction on behalf of users
- **Funds transfer directly**: No prior approval needed, no user-paid gas

This protocol prioritizes BSC and theoretically supports all EIP-7702 enabled EVM chains.

## Core Features

- **EIP-7702 Delegated Execution** with sponsored gas
- **HTTP 402 Payment Semantics** with standardized `paymentDetails`
- **Single & Batch Payments** with multi-asset routing
- **Dual Anti-Replay**: EIP-7702 auth nonce + application-level nonce/paymentId
- **Strong Witness Binding**: Domain separation, order/resource context binding
- **Facilitator Role**: Stateless verification + settlement + observability

## Why x402 BNB?

Traditional x402 requires ERC-3009 support, limiting token compatibility. x402 BNB eliminates this:

- ✅ Works with **any existing ERC-20** on BSC (no token upgrades)
- ✅ **No initial approval** transaction needed
- ✅ **Gasless for users** - facilitator sponsors all gas
- ✅ **Production-ready** for BSC mainnet/testnet
- ✅ **Compatible with Account Abstraction** (EIP-4337 infrastructure)

## Architecture Flow

```
1. Client → Request resource
2. Server → 402 Response with paymentDetails
   - scheme: evm/eip7702-delegated-payment or evm/eip7702-delegated-batch
   - networkId, token(s), amount(s), recipient(s)
   - implementationContract (whitelisted delegation target)
   - EIP-712 typed-data for witness
3. Client → Signs offline:
   - witnessSig (EIP-712)
   - authorization tuple [chain_id, implementationContract, nonce, y_parity, r, s] (EIP-7702)
4. Client → Sends X-PAYMENT: <payload>
5. Server/Facilitator → Verifies signatures & constraints
6. Facilitator → Constructs & submits 0x04 transaction:
   - to = owner (user's EOA)
   - authorization_list = [tuple]
   - data = encodeFunctionData(pay/payBatch, witnessPayload, witnessSig)
7. Delegated implementation → Executes in EOA context, validates witness, performs ERC-20 transfer
8. Facilitator → Returns Payment Execution Response
```

## Quick Start

### Installation

```bash
pnpm install
```

### Usage

#### 1. Client-Side Payment Creation

```typescript
import { createPaymentHeader, selectPaymentDetails } from "@x402-bnb/core";
import { privateKeyToAccount } from "viem/accounts";

// Create account
const account = privateKeyToAccount("0x...");

// Fetch 402 response from server
const response = await fetch("https://api.example.com/resource");
const paymentRequired = await response.json();

// Select payment method
const paymentDetails = selectPaymentDetails(paymentRequired, {
  network: "bsc-testnet",
});

// Create signed payment header
const paymentHeader = await createPaymentHeader(account, paymentDetails);

// Make request with payment
const result = await fetch("https://api.example.com/resource", {
  headers: {
    "X-PAYMENT": paymentHeader,
  },
});
```

#### 2. Server-Side Integration (Express)

```typescript
import express from "express";
import { createX402BnbMiddleware } from "@x402-bnb/middleware-express";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";

const app = express();

// Create sponsor wallet
const sponsor = privateKeyToAccount(process.env.SPONSOR_KEY);
const walletClient = createWalletClient({
  account: sponsor,
  chain: bscTestnet,
  transport: http(),
});

// Apply x402 BNB middleware
app.use(
  createX402BnbMiddleware({
    network: "bsc-testnet",
    recipientAddress: "0x...",
    implementationContract: "0x...",
    verifyingContract: "0x...",
    walletClient,
    endpoints: [
      {
        path: "/api/premium",
        amount: "1000000", // 1 USDT (6 decimals)
        token: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
        description: "Premium API access",
      },
    ],
  })
);

// Protected route
app.get("/api/premium", (req, res) => {
  res.json({
    data: "Premium content",
    payer: req.payment?.payer,
  });
});

app.listen(3000);
```

#### 3. Running the Facilitator

```bash
cd packages/facilitator

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start facilitator
pnpm run dev
```

The facilitator exposes REST endpoints:
- `POST /verify` - Verify payment signatures
- `POST /settle` - Submit payment to blockchain
- `GET /supported` - List supported networks

## Contract Interfaces

### Single Payment

```solidity
function pay(
  address owner,
  address token,
  uint256 amount,
  address to,
  uint256 deadline,
  bytes32 paymentId,
  bytes witnessSig
) external;
```

### Batch Payment

```solidity
struct PaymentItem {
  address token;
  uint256 amount;
  address to;
}

function payBatch(
  address owner,
  PaymentItem[] calldata items,
  uint256 deadline,
  bytes32 paymentId,
  bytes witnessSig
) external;
```

## Payload Examples

### Witness (EIP-712)

```json
{
  "domain": {
    "name": "x402 BNB",
    "version": "1",
    "chainId": 56,
    "verifyingContract": "0xServerVerifier"
  },
  "types": {
    "Witness": [
      {"name":"owner","type":"address"},
      {"name":"token","type":"address"},
      {"name":"amount","type":"uint256"},
      {"name":"to","type":"address"},
      {"name":"deadline","type":"uint256"},
      {"name":"paymentId","type":"bytes32"},
      {"name":"nonce","type":"uint256"}
    ]
  },
  "primaryType": "Witness",
  "message": {
    "owner": "0xOwner",
    "token": "0xTokenAddress",
    "amount": "1000000",
    "to": "0xServerSettlementWallet",
    "deadline": "1735660000",
    "paymentId": "0xdeadbeef...",
    "nonce": "123456789"
  }
}
```

### Authorization (EIP-7702)

```json
{
  "chain_id": 56,
  "address": "0xImplementation",
  "nonce": 42,
  "y_parity": 1,
  "r": "0x...",
  "s": "0x..."
}
```

Digest: `keccak(0x05 || rlp([chain_id, address, nonce]))`, signed by owner.

## HTTP 402 Integration

### Server Returns `paymentDetails`

```json
{
  "scheme": "evm/eip7702-delegated-payment",
  "networkId": "bsc-mainnet",
  "token": "0xTokenAddress",
  "amount": "1000000",
  "to": "0xServerSettlementWallet",
  "implementationContract": "0xImplementation",
  "witness": { /* EIP-712 typed-data */ },
  "authorization": { /* auth tuple template */ }
}
```

### Client Sends `X-PAYMENT` Header

Base64-encoded JSON containing both signed witness and signed authorization.

## Security

- **Dual Nonce**: EIP-7702 auth nonce + application nonce/paymentId
- **Short Deadline**: Expires after timeout, limits attack window
- **Implementation Whitelist**: Only approved contracts can be delegated to
- **Per-Account Limits**: Token amount caps, recipient blacklist, rate limits
- **Immutable Event Logs**: Audit-friendly, traceable
- **Revocation Path**: Users can clear delegation via EIP-7702 tx with `address = 0x0`

## Supported Networks

- **BNB Smart Chain** (Mainnet/Testnet) - EIP-7702 enabled
- Any EIP-7702 enabled EVM chain (configure RPC accordingly)

## Observability

- OpenTelemetry compatible traces/metrics
- Export via OTLP to Prometheus/Grafana/Honeycomb
- HTTP method, status, latency, routing metrics

## Configuration

### Environment Variables

```env
# Server
HOST=0.0.0.0
PORT=8080

# Signer
SPONSOR_PRIVATE_KEY=0x...

# RPC URLs (at least one required for each network)
RPC_URL_BSC_MAINNET=https://bsc-dataseed1.binance.org
RPC_URL_BSC_TESTNET=https://data-seed-prebsc-1-s1.binance.org:8545

# Whitelist
IMPLEMENTATION_WHITELIST=0x...,0x...
```

## Roadmap

- ✅ BSC mainnet/testnet support with sponsored payments & batch routing
- 🚧 Witness extensions (jurisdiction/KYC/identity weighting)
- 🚧 Smart nonce strategies & storage optimization
- 🚧 Cross-chain expansion to more EIP-7702 networks

## Packages

- **[@x402-bnb/core](./packages/core)** - Core SDK with signing and verification
- **[@x402-bnb/middleware-express](./packages/middleware-express)** - Express middleware
- **[@x402-bnb/middleware-hono](./packages/middleware-hono)** - Hono middleware
- **[@x402-bnb/facilitator](./packages/facilitator)** - Facilitator service

## Examples

See [examples/bsc-testnet](./examples/bsc-testnet) for complete working examples on BSC testnet.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Apache-2.0

## Acknowledgments

This project is inspired by and builds upon the [x402 protocol](https://github.com/coinbase/x402) by Coinbase. We're grateful for their pioneering work in bringing gasless, programmable payments to the web.

The x402 BNB implementation extends this vision with EIP-7702 delegated execution, enabling:
- Universal ERC-20 compatibility without token upgrades
- No initial approval transactions
- Seamless integration with BSC and future EIP-7702 networks

Special thanks to the x402 community and all contributors to the original protocol.

## About Quack AI

x402 BNB is developed by Quack AI to enhance governance execution and payment flows in decentralized ecosystems. Our governance scoring engine integrates directly with payment settlement for trusted, auditable proposal execution.

For more information: [Quack AI Website](https://quackai.ai/)

---

**Built with ❤️ for the decentralized web**

