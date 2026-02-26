import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, sessions } from "./models/auth";
import { relations } from "drizzle-orm";

export { users, sessions };

export const metals = pgTable("metals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  currentPrice: numeric("current_price").notNull(),
});

export const vaults = pgTable("vaults", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), 
  metalId: integer("metal_id").notNull().references(() => metals.id),
  vaultId: integer("vault_id").notNull().references(() => vaults.id),
  quantity: numeric("quantity").notNull().default("0"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  metalId: integer("metal_id").notNull().references(() => metals.id),
  vaultId: integer("vault_id").notNull().references(() => vaults.id),
  type: text("type").notNull(), // 'buy' or 'sell'
  quantity: numeric("quantity").notNull(),
  priceAtTime: numeric("price_at_time").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMetalSchema = createInsertSchema(metals);
export const insertVaultSchema = createInsertSchema(vaults);
export const insertPortfolioSchema = createInsertSchema(portfolios);
export const insertTransactionSchema = createInsertSchema(transactions);

export type Metal = typeof metals.$inferSelect;
export type Vault = typeof vaults.$inferSelect;
export type Portfolio = typeof portfolios.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type BuySellRequest = {
  metalId: number;
  vaultId: number;
  type: 'buy' | 'sell';
  quantity: string;
};