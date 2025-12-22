import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { keccak256, toUtf8Bytes } from "ethers";
import { BrowserProvider } from "ethers";
import {
  encodeFunctionData,
  WalletClient,
  Hex,
  createPublicClient,
  http,
} from "viem";
import {
  Eip712Domain,
  encodeBase64,
  NetworkConfigs,
  PaymentDetails,
  PaymentImplementationAbi,
  PaymentItem,
  PaymentScheme,
  prepareAuthorization,
  prepareWitness,
  SettlementResult,
  signAuthorization,
  SignedPaymentPayload,
  signWitness,
  SupportedNetworks,
  TransactionError,
} from "@q402/core";
import {
  LocalAccount,
  PrivateKeyAccount,
  privateKeyToAccount,
} from "viem/accounts";
import { bscTestnet } from "viem/chains";
import { Buffer } from "buffer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeResourceHash(obj: any) {
  const json = JSON.stringify(obj);
  return keccak256(toUtf8Bytes(json));
}

export async function requestExecution(txPayload: Record<string, any>) {
  // @ts-ignore
  if (!window.ethereum) {
    throw new Error(
      "No Ethereum provider found. Please install a wallet like MetaMask.",
    );
  }
  // 1) initial request - server will respond 402 with paymentDetails
  const res = await fetch("/api/execute-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txPayload }),
  });

  if (res.status === 402) {
    const body = await res.json(); // body.accepts[0] is paymentDetails
    const paymentDetails = body.accepts?.[0];

    // Wallet sign (ethers)
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // @ts-ignore
    const provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const { domain, types, message } = paymentDetails.witness;
    const signature = await signer.signTypedData(domain, types, message);

    // Build signed payload + txPayload and encode
    const signedPayload = { paymentDetails, signature, txPayload };
    const raw = JSON.stringify(signedPayload);
    const base64 = btoa(unescape(encodeURIComponent(raw))); // browser base64

    // 2) Resend with x-payment header
    const final = await fetch("/api/execute-transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-payment": base64,
      },
      body: JSON.stringify({ txPayload }),
    });

    const result = await final.json();
    return result;
  } else {
    // If not 402, maybe the request was already authorized (rare)
    return res.json();
  }
}

/**
 * Stringify object with deterministic key ordering
 */
export function stableStringify(obj: any): string {
  const replacer = (_: string, value: any) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const ordered: Record<string, any> = {};
      Object.keys(value)
        .sort()
        .forEach((k) => {
          ordered[k] = value[k];
        });
      return ordered;
    }
    return value;
  };
  return JSON.stringify(obj, replacer);
}

export function typify(obj: any): any {
  if (obj === null || obj === undefined) {
    return typeof obj;
  }

  if (Array.isArray(obj)) {
    return obj.length > 0 ? `[${typify(obj[0])}]` : `[]`;
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        result[key] = typify(obj[key]);
      }
    }
    return result;
  }

  return typeof obj;
}

/**
 * Hash canonical JSON string using keccak256
 */
export function payloadHash(canonicalJson: string): string {
  return keccak256(toUtf8Bytes(canonicalJson));
}

/**
 * Create hash of the transaction payload that both client and server can verify
 */
export function hashTransactionPayload(txPayload: any): string {
  const canonical = stableStringify(txPayload);
  return payloadHash(canonical);
}

type AccountType = ReturnType<typeof privateKeyToAccount>;

export async function settlePayment(
  walletClient: WalletClient,
  payload: SignedPaymentPayload,
  account: AccountType,
): Promise<SettlementResult> {
  try {
    const { authorization, paymentDetails, witnessSignature } = payload;

    // Get network config
    const networkConfig = NetworkConfigs[paymentDetails.networkId];
    if (!networkConfig) {
      throw new TransactionError(
        `Unsupported network: ${paymentDetails.networkId}`,
      );
    }

    // Determine if single or batch payment
    const isBatch =
      paymentDetails.scheme === PaymentScheme.EIP7702_DELEGATED_BATCH;

    // Encode function data
    let data: Hex;
    if (isBatch) {
      // Batch payment
      const batchDetails = payload.paymentDetails as any; // Type assertion for batch
      const items: PaymentItem[] = batchDetails.items || [];

      data = encodeFunctionData({
        abi: PaymentImplementationAbi,
        functionName: "payBatch",
        args: [
          authorization.address, // owner
          items.map((item) => ({
            token: item.token,
            amount: item.amount,
            to: item.to,
          })),
          BigInt(0), // deadline - from witness
          "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex, // paymentId
          witnessSignature,
        ],
      });
    } else {
      // Single payment
      data = encodeFunctionData({
        abi: PaymentImplementationAbi,
        functionName: "pay",
        args: [
          authorization.address, // owner
          paymentDetails.token,
          BigInt(paymentDetails.amount),
          paymentDetails.to,
          BigInt(0), // deadline - from witness
          "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex, // paymentId
          witnessSignature,
        ],
      });
    }

    // Prepare authorization list for type 0x04 transaction
    const authorizationList = [
      {
        chainId: Number(authorization.chainId),
        address: authorization.address,
        nonce: Number(authorization.nonce),
        yParity: authorization.yParity,
        r: authorization.r,
        s: authorization.s,
      },
    ];

    // Send type 0x04 transaction
    // Note: This requires viem experimental features for EIP-7702
    const hash = await walletClient.sendTransaction({
      to: authorization.address, // Send to owner's EOA
      data,
      authorizationList,
      account,
      chain: bscTestnet,
    });

    // Wait for confirmation
    const publicClient = createPublicClient({
      chain: {
        id: networkConfig.chainId,
        name: networkConfig.name,
        rpcUrls: {
          default: { http: [networkConfig.rpcUrl] },
          public: { http: [networkConfig.rpcUrl] },
        },
        nativeCurrency: {
          name: "BNB",
          symbol: "BNB",
          decimals: 18,
        },
      },
      transport: http(networkConfig.rpcUrl),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      success: receipt.status === "success",
      txHash: hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// export const replacer = (_key: string, value: unknown) => {
//   if (typeof value === "bigint") return value.toString();
//   return value;
// }

export const mockPaymentDetails = {
  paymentDetails: {
    scheme: "EIP7702_DELEGATED",
    networkId: "bscTestnet",
    token: "native",
    amount: "10000000000",
    to: "0xB1655beD2370B9Ad33Dd4ab905a7923D29Ab6778",
    implementationContract: "0x9c477aB79Ff70Ea00374ce3060618715c20336AA",
    witness: {
      domain: {
        name: "q402",
        version: "1",
        chainId: 97,
        verifyingContract: "0x9c477aB79Ff70Ea00374ce3060618715c20336AA",
      },
      types: {
        Witness: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "token",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
          {
            name: "to",
            type: "address",
          },
          {
            name: "deadline",
            type: "uint256",
          },
          {
            name: "paymentId",
            type: "bytes32",
          },
          {
            name: "nonce",
            type: "uint256",
          },
        ],
      },
      primaryType: "Witness",
      message: {
        owner: "0x0000000000000000000000000000000000000000",
        token: "native",
        amount: "10000000000",
        to: "0xB1655beD2370B9Ad33Dd4ab905a7923D29Ab6778",
        deadline: 1766206876,
        paymentId:
          "0x29ad407fb429ddd78f3ba4daeb905bf864b4fe7d7bb521c6f81bc6e2d4f22f47",
        nonce: 0,
      },
    },
    authorization: {
      chainId: 97,
      address: "0x9c477aB79Ff70Ea00374ce3060618715c20336AA",
      nonce: 0,
    },
  },
};

export const createPaymentHeaderLocal = async (
  account: LocalAccount | PrivateKeyAccount,
  paymentDetails: PaymentDetails,
): Promise<string> => {
  // Prepare witness message
  const witnessMessage = prepareWitness({
    owner: account.address,
    token: paymentDetails.token,
    amount: paymentDetails.amount,
    to: paymentDetails.to,
  });

  // create domain from payment details
  const domain: Eip712Domain = {
    name: "q402",
    version: "1",
    chainId: paymentDetails.authorization.chainId,
    verifyingContract: paymentDetails.authorization.address,
  };

  // Sign Witness
  // @ts-ignore
  const witnessSignature = await signWitness(account, domain, witnessMessage);

  // Prepare authorization
  const unsignedAuth = prepareAuthorization({
    chainId: paymentDetails.authorization.chainId,
    implementationAddress: paymentDetails.implementationContract,
    nonce: paymentDetails.authorization.nonce,
  });

  // Sign authorization
  // @ts-ignore
  const signedAuth = await signAuthorization(account, unsignedAuth);

  const payload: SignedPaymentPayload = {
    witnessSignature,
    authorization: signedAuth,
    paymentDetails,
  };

  const encoded = base64EncodeJson(payload);

  return encoded;
};

/**
 * Recursively convert BigInt values into strings so JSON.stringify works.
 */
export function normalizeBigInts(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") return obj.toString();

  if (Array.isArray(obj)) {
    return obj.map((v) => normalizeBigInts(v));
  }

  if (typeof obj === "object") {
    const out: Record<string, any> = {};
    for (const k of Object.keys(obj)) {
      out[k] = normalizeBigInts(obj[k]);
    }
    return out;
  }

  return obj;
}

/**
 * Encode an object to base64 after normalizing BigInts.
 * Works both in Node and in browser.
 */
export function base64EncodeJson(obj: any): string {
  const normalized = normalizeBigInts(obj);
  const json = JSON.stringify(normalized);

  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    // browser: ensure UTF-8 safe
    return window.btoa(unescape(encodeURIComponent(json)));
  }
  // Node
  return Buffer.from(json, "utf8").toString("base64");
}

// Recursive function to convert all BigInts to strings
export function convertBigIntsToStrings(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = convertBigIntsToStrings(obj[key]);
      }
    }
    return result;
  }

  return obj;
}
