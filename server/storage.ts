import { db } from "./db";
import { 
  metals, vaults, portfolios, transactions,
  type Metal, type Vault, type Portfolio, type Transaction,
  type BuySellRequest 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Metals
  getMetals(): Promise<Metal[]>;
  getMetal(id: number): Promise<Metal | undefined>;
  
  // Vaults
  getVaults(): Promise<Vault[]>;
  getVault(id: number): Promise<Vault | undefined>;
  
  // Portfolio
  getPortfolio(userId: string): Promise<Portfolio[]>;
  getPortfolioItem(userId: string, metalId: number, vaultId: number): Promise<Portfolio | undefined>;
  
  // Transactions
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(userId: string, req: BuySellRequest, price: string): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  async getMetals(): Promise<Metal[]> {
    return await db.select().from(metals);
  }

  async getMetal(id: number): Promise<Metal | undefined> {
    const [metal] = await db.select().from(metals).where(eq(metals.id, id));
    return metal;
  }

  async getVaults(): Promise<Vault[]> {
    return await db.select().from(vaults);
  }

  async getVault(id: number): Promise<Vault | undefined> {
    const [vault] = await db.select().from(vaults).where(eq(vaults.id, id));
    return vault;
  }

  async getPortfolio(userId: string): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async getPortfolioItem(userId: string, metalId: number, vaultId: number): Promise<Portfolio | undefined> {
    const [item] = await db.select().from(portfolios).where(
      and(
        eq(portfolios.userId, userId),
        eq(portfolios.metalId, metalId),
        eq(portfolios.vaultId, vaultId)
      )
    );
    return item;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async createTransaction(userId: string, req: BuySellRequest, price: string): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values({
      userId,
      metalId: req.metalId,
      vaultId: req.vaultId,
      type: req.type,
      quantity: req.quantity,
      priceAtTime: price,
    }).returning();

    const currentItem = await this.getPortfolioItem(userId, req.metalId, req.vaultId);
    let newQuantity = parseFloat(req.quantity);
    
    if (req.type === 'sell') {
      newQuantity = -newQuantity;
    }

    if (currentItem) {
      const updatedQuantity = parseFloat(currentItem.quantity) + newQuantity;
      await db.update(portfolios)
        .set({ quantity: updatedQuantity.toString() })
        .where(eq(portfolios.id, currentItem.id));
    } else {
      if (req.type === 'buy') {
        await db.insert(portfolios).values({
          userId,
          metalId: req.metalId,
          vaultId: req.vaultId,
          quantity: newQuantity.toString(),
        });
      }
    }

    return tx;
  }
}

export const storage = new DatabaseStorage();