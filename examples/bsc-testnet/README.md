# BSC Testnet Examples

This directory contains example implementations of x402 BNB on BSC testnet.

## Prerequisites

1. Node.js 18+
2. pnpm
3. BSC testnet account with BNB for gas
4. BSC testnet USDT (or other test tokens)

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env` file:

```env
# For client examples
PRIVATE_KEY=0x...

# For server examples
SPONSOR_PRIVATE_KEY=0x...
RECIPIENT_ADDRESS=0x...
IMPLEMENTATION_CONTRACT=0x...
VERIFYING_CONTRACT=0x...
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

## Running Examples

### Client Examples

**Simple Payment:**

```bash
pnpm run client:simple
```

Demonstrates creating and signing a single payment.

**Batch Payment:**

```bash
pnpm run client:batch
```

Demonstrates creating and signing a batch payment with multiple recipients.

### Server Examples

**Express Server:**

```bash
pnpm run server:express
```

Starts an Express server with x402 BNB middleware on port 3000.

**Hono Server:**

```bash
pnpm run server:hono
```

Starts a Hono server with x402 BNB middleware on port 3000.

## Testing the Flow

1. Start a server:

```bash
pnpm run server:express
```

2. Access a protected endpoint without payment:

```bash
curl http://localhost:3000/api/premium-data
```

You'll receive a 402 Payment Required response with payment details.

3. Create a payment using the client example and send it with the header:

```bash
# Use the X-PAYMENT header from client output
curl -H "X-PAYMENT: <header>" http://localhost:3000/api/premium-data
```

4. Receive the protected resource along with payment confirmation.

## Getting Test Tokens

### BSC Testnet BNB

Get BNB from BSC testnet faucet:
- https://testnet.bnbchain.org/faucet-smart

### BSC Testnet USDT

The test USDT contract: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`

You can request test USDT from various testnet faucets or use a test token faucet.

## Contract Deployment

Before running these examples, you need to deploy the EIP-7702 implementation contract. See the main README for deployment instructions.

## Troubleshooting

### "Implementation contract not deployed"

Make sure you've deployed the implementation contract and updated the `.env` file with the correct address.

### "Insufficient funds"

Make sure your account has enough BNB for gas and USDT (or test tokens) for payments.

### "Verification failed"

Check that:
- Your private key is correct
- The implementation contract address is correct
- The payment details match the server configuration
- Your account has sufficient token balance

## Learn More

- [Main README](../../README.md)
- [Core SDK Documentation](../../packages/core/README.md)
- [Express Middleware Documentation](../../packages/middleware-express/README.md)
- [Hono Middleware Documentation](../../packages/middleware-hono/README.md)

