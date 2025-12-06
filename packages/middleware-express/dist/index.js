'use strict';

var core = require('@q402/core');

// src/middleware.ts
function create402Response(config, endpoint, _req) {
  const networkConfig = core.NetworkConfigs[config.network];
  const paymentDetails = {
    scheme: core.PaymentScheme.EIP7702_DELEGATED,
    networkId: config.network,
    token: endpoint.token,
    amount: endpoint.amount,
    to: config.recipientAddress,
    implementationContract: config.implementationContract,
    witness: {
      domain: {
        name: "q402",
        version: "1",
        chainId: networkConfig.chainId,
        verifyingContract: config.verifyingContract
      },
      types: {
        Witness: [
          { name: "owner", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "paymentId", type: "bytes32" },
          { name: "nonce", type: "uint256" }
        ]
      },
      primaryType: "Witness",
      message: {
        owner: "0x0000000000000000000000000000000000000000",
        // Placeholder
        token: endpoint.token,
        amount: BigInt(endpoint.amount),
        to: config.recipientAddress,
        deadline: BigInt(Math.floor(Date.now() / 1e3) + 900),
        paymentId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        nonce: BigInt(0)
      }
    },
    authorization: {
      chainId: networkConfig.chainId,
      address: config.implementationContract,
      nonce: 0
    }
  };
  const response = {
    x402Version: 1,
    accepts: [paymentDetails]
  };
  return response;
}
function send402Response(res, config, endpoint, req) {
  const response = create402Response(config, endpoint);
  res.status(402).json(response);
}

// src/middleware.ts
var X_PAYMENT_HEADER = "x-payment";
var X_PAYMENT_RESPONSE_HEADER = "x-payment-response";
function createQ402Middleware(config) {
  return async (req, res, next) => {
    try {
      const endpoint = config.endpoints.find((ep) => req.path === ep.path);
      if (!endpoint) {
        next();
        return;
      }
      const paymentHeader = req.headers[X_PAYMENT_HEADER];
      if (!paymentHeader) {
        send402Response(res, config, endpoint, req);
        return;
      }
      let payload;
      try {
        payload = core.decodeBase64(paymentHeader);
      } catch {
        res.status(400).json({
          error: "Invalid payment header format"
        });
        return;
      }
      const verificationResult = await core.verifyPayment(payload);
      if (!verificationResult.isValid) {
        res.status(402).json({
          x402Version: 1,
          accepts: [],
          error: `Payment verification failed: ${verificationResult.invalidReason}`
        });
        return;
      }
      req.payment = {
        verified: true,
        payer: verificationResult.payer,
        amount: "amount" in payload.paymentDetails ? payload.paymentDetails.amount : void 0,
        token: "token" in payload.paymentDetails ? payload.paymentDetails.token : void 0
      };
      if (config.autoSettle !== false) {
        try {
          const settlementResult = await core.settlePayment(config.walletClient, payload);
          if (settlementResult.success) {
            const executionResponse = {
              txHash: settlementResult.txHash,
              blockNumber: settlementResult.blockNumber,
              status: "confirmed"
            };
            res.setHeader(X_PAYMENT_RESPONSE_HEADER, core.encodeBase64(executionResponse));
          } else {
            console.error("Settlement failed:", settlementResult.error);
          }
        } catch (error) {
          console.error("Settlement error:", error);
        }
      }
      next();
    } catch (error) {
      console.error("Middleware error:", error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  };
}

exports.create402Response = create402Response;
exports.createQ402Middleware = createQ402Middleware;
exports.send402Response = send402Response;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map