import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";
import { setupSecurity } from "../server/security-middleware";

const app = express();

// Trust first proxy (important for rate limiting behind proxies)
app.set('trust proxy', 1);

// Remove the X-Powered-By header so attackers can't easily fingerprint Express
app.disable("x-powered-by");

// Setup security middleware
setupSecurity(app);

// Register API routes
registerRoutes(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
