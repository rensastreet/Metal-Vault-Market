import { useQuery } from "@tanstack/react-query";
import { api, type PortfolioResponse } from "@shared/routes";

export function usePortfolio() {
  return useQuery({
    queryKey: [api.portfolio.get.path],
    queryFn: async () => {
      const res = await fetch(api.portfolio.get.path, { credentials: "include" });
      if (res.status === 401) return []; // Handle unauthorized gracefully if needed
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      const data = await res.json();
      return api.portfolio.get.responses[200].parse(data);
    },
  });
}
