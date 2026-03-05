import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";
import { db } from "./db";
import { metals, vaults } from "@shared/schema";

async function seedDatabase() {
  const existingMetals = await storage.getMetals();
  if (existingMetals.length === 0) {
    const seedMetals = [
      { name: "Gold", symbol: "XAU", currentPrice: "2350.50" },
      { name: "Silver", symbol: "XAG", currentPrice: "28.30" },
      { name: "Platinum", symbol: "XPT", currentPrice: "1050.00" },
      { name: "Palladium", symbol: "XPD", currentPrice: "1020.20" },
      { name: "Diamonds", symbol: "DSD", currentPrice: "5250.00" },
    ];
    for (const m of seedMetals) {
      await db.insert(metals).values(m);
    }
  }

  const existingVaults = await storage.getVaults();
  if (existingVaults.length === 0) {
    const seedVaults = [
      { name: "Toronto Vault", location: "Toronto", latitude: "43.651070", longitude: "-79.347015" },
      { name: "New York Vault", location: "New York", latitude: "40.712776", longitude: "-74.005974" },
      { name: "Delaware Vault", location: "Delaware", latitude: "39.158168", longitude: "-75.524368" },
      { name: "London Vault", location: "London", latitude: "51.5074", longitude: "-0.1278" },
      { name: "Zurich Vault", location: "Zurich", latitude: "47.3769", longitude: "8.5417" },
      { name: "Frankfurt Vault", location: "Frankfurt", latitude: "50.1109", longitude: "8.6821" },
      { name: "Liechtenstein Vault", location: "Liechtenstein", latitude: "47.1660", longitude: "9.5554" },
      { name: "Dubai Vault", location: "Dubai", latitude: "25.2048", longitude: "55.2708" },
      { name: "Singapore Vault", location: "Singapore", latitude: "1.3521", longitude: "103.8198" },
      { name: "Hong Kong Vault", location: "Hong Kong", latitude: "22.3193", longitude: "114.1694" },
    ];
    for (const v of seedVaults) {
      await db.insert(vaults).values(v);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Call seed database
  seedDatabase().catch(console.error);

  app.get(api.metals.list.path, async (req, res) => {
    const metalsList = await storage.getMetals();
    res.json(metalsList);
  });

  app.get(api.vaults.list.path, async (req, res) => {
    const vaultsList = await storage.getVaults();
    res.json(vaultsList);
  });

  app.get(api.portfolio.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const portfolio = await storage.getPortfolio(userId);
    res.json(portfolio);
  });

  app.get(api.transactions.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const txs = await storage.getTransactions(userId);
    res.json(txs);
  });

  app.post(api.transactions.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      const metal = await storage.getMetal(input.metalId);
      if (!metal) {
        return res.status(400).json({ message: "Invalid metal ID" });
      }

      if (input.type === 'sell') {
        const item = await storage.getPortfolioItem(userId, input.metalId, input.vaultId);
        if (!item || parseFloat(item.quantity) < parseFloat(input.quantity)) {
          return res.status(400).json({ message: "Insufficient quantity to sell" });
        }
      }

      const tx = await storage.createTransaction(userId, input, metal.currentPrice);
      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}