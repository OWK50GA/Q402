import express from "express";
import type { Express } from "express";
import type { SupportedNetwork } from "@x402-bnb/core";
import type { EnvConfig } from "../config/env";
import type { NetworkClients } from "../config/networks";
import { handleVerify } from "./routes/verify";
import { handleSettle } from "./routes/settle";
import { handleSupported } from "./routes/supported";

/**
 * Create Express server with facilitator routes
 */
export function createServer(
  config: EnvConfig,
  clientsMap: Map<SupportedNetwork, NetworkClients>,
): Express {
  const app = express();

  // Middleware
  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    
    next();
  });

  // Routes
  app.get("/", (req, res) => {
    res.json({
      name: "x402 BNB Facilitator",
      version: "0.1.0",
      endpoints: {
        verify: "POST /verify",
        settle: "POST /settle",
        supported: "GET /supported",
      },
    });
  });

  app.post("/verify", (req, res) => handleVerify(req, res, config));

  app.post("/settle", (req, res) => handleSettle(req, res, clientsMap));

  app.get("/supported", (req, res) => handleSupported(req, res, clientsMap));

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  });

  return app;
}

