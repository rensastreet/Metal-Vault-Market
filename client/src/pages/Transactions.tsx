import { useTransactions } from "@/hooks/use-transactions";
import { useMetals } from "@/hooks/use-metals";
import { useVaults } from "@/hooks/use-vaults";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, Search, Filter } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function Transactions() {
  const { data: transactions = [], isLoading: tLoading } = useTransactions();
  const { data: metals = [] } = useMetals();
  const { data: vaults = [] } = useVaults();
  const [search, setSearch] = useState("");

  if (tLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const filteredTx = transactions.filter(tx => {
    const metal = metals.find(m => m.id === tx.metalId);
    const vault = vaults.find(v => v.id === tx.vaultId);
    const searchStr = `${metal?.name} ${vault?.name} ${tx.type}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">Audit log of all physical bullion movements.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-10 glass-card border-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Vault Location</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Execution Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTx.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {search ? "No matching transactions found." : "No transactions recorded yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTx.map((tx) => {
                const metal = metals.find(m => m.id === tx.metalId);
                const vault = vaults.find(v => v.id === tx.vaultId);
                const isBuy = tx.type === 'buy';
                const totalValue = parseFloat(tx.quantity) * parseFloat(tx.priceAtTime);

                return (
                  <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 group transition-colors">
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(tx.timestamp), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${isBuy ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isBuy ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {isBuy ? 'Acquisition' : 'Liquidation'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{metal?.name}</TableCell>
                    <TableCell>{vault?.name}</TableCell>
                    <TableCell className="text-right font-mono">{parseFloat(tx.quantity).toFixed(3)} oz</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(tx.priceAtTime)}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">{formatCurrency(totalValue)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
