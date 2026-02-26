import { z } from "zod";
import { metals, vaults, portfolios, transactions } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  badRequest: z.object({ message: z.string() }),
};

export const api = {
  metals: {
    list: {
      method: "GET" as const,
      path: "/api/metals" as const,
      responses: {
        200: z.array(z.custom<typeof metals.$inferSelect>()),
      },
    },
  },
  vaults: {
    list: {
      method: "GET" as const,
      path: "/api/vaults" as const,
      responses: {
        200: z.array(z.custom<typeof vaults.$inferSelect>()),
      },
    },
  },
  portfolio: {
    get: {
      method: "GET" as const,
      path: "/api/portfolio" as const,
      responses: {
        200: z.array(z.custom<typeof portfolios.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  transactions: {
    list: {
      method: "GET" as const,
      path: "/api/transactions" as const,
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/transactions" as const,
      input: z.object({
        metalId: z.number(),
        vaultId: z.number(),
        type: z.enum(["buy", "sell"]),
        quantity: z.string(),
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.badRequest,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type MetalResponse = z.infer<typeof api.metals.list.responses[200]>[0];
export type VaultResponse = z.infer<typeof api.vaults.list.responses[200]>[0];
export type PortfolioResponse = z.infer<typeof api.portfolio.get.responses[200]>[0];
export type TransactionResponse = z.infer<typeof api.transactions.list.responses[200]>[0];
export type BuySellInput = z.infer<typeof api.transactions.create.input>;