import { useQuery } from "@tanstack/react-query";
import { api, type MetalResponse } from "@shared/routes";

export function useMetals() {
  return useQuery({
    queryKey: [api.metals.list.path],
    queryFn: async () => {
      const res = await fetch(api.metals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch metals");
      const data = await res.json();
      return api.metals.list.responses[200].parse(data);
    },
  });
}
