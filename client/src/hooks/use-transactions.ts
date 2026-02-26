import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type TransactionResponse, type BuySellInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.list.path, { credentials: "include" });
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      return api.transactions.list.responses[200].parse(data);
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BuySellInput) => {
      const validated = api.transactions.create.input.parse(data);
      const res = await fetch(api.transactions.create.path, {
        method: api.transactions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "An error occurred" }));
        throw new Error(errorData.message || "Failed to create transaction");
      }
      
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate both transactions and portfolio
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.portfolio.get.path] });
      toast({
        title: "Transaction Successful",
        description: "Your portfolio has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
