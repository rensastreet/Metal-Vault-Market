import { useQuery } from "@tanstack/react-query";
import { api, type VaultResponse } from "@shared/routes";

export function useVaults() {
  return useQuery({
    queryKey: [api.vaults.list.path],
    queryFn: async () => {
      const res = await fetch(api.vaults.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vaults");
      const data = await res.json();
      return api.vaults.list.responses[200].parse(data);
    },
  });
}
