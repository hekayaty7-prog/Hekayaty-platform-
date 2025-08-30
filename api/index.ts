import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";

// Create app instance for each request to avoid state issues
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = express();

  // Trust first proxy (important for rate limiting behind proxies)
  app.set('trust proxy', 1);

  // Remove the X-Powered-By header so attackers can't easily fingerprint Express
  app.disable("x-powered-by");

  // Basic middleware for JSON parsing
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Register API routes
  registerRoutes(app);

  // Handle the request
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
