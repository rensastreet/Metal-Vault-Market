import { useState } from "react";
import GlobeMap from "@/components/GlobeMap";
import VaultPanel from "@/components/VaultPanel";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useMetals } from "@/hooks/use-metals";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import type { VaultResponse } from "@shared/routes";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export default function Dashboard() {
  const [selectedVault, setSelectedVault] = useState<VaultResponse | null>(null);
  
  const { data: portfolio = [], isLoading: pLoading } = usePortfolio();
  const { data: metals = [] } = useMetals();
  const { data: transactions = [] } = useTransactions();

  // Calculate total portfolio value
  const totalValue = portfolio.reduce((acc, item) => {
    const metal = metals.find(m => m.id === item.metalId);
    if (!metal) return acc;
    return acc + (parseFloat(item.quantity) * parseFloat(metal.currentPrice));
  }, 0);

  const recentTx = [...transactions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  return (
    <div>
      <div className="space-y-6 md:space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your global precious metals portfolio.</p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-20%] w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Holdings Value</p>
            <h2 className="text-4xl font-display font-bold text-foreground tracking-tight">
              {pLoading ? "..." : formatCurrency(totalValue)}
            </h2>
          </div>

          <div className="glass-card p-6 rounded-2xl md:col-span-2">
             <div className="flex items-center justify-between mb-4">
               <p className="text-sm font-medium text-muted-foreground">Market Pulse (Spot / oz)</p>
               <Activity className="w-4 h-4 text-primary" />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {metals.map(metal => (
                 <div key={metal.id} className="border-l-2 border-primary/50 pl-3">
                   <p className="text-xs text-muted-foreground">{metal.name}</p>
                   <p className="font-mono font-medium mt-1">{formatCurrency(metal.currentPrice)}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Map & Activity Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <div className="lg:col-span-2 h-full rounded-2xl border border-white/5 relative">
             <GlobeMap onVaultSelect={setSelectedVault} />
          </div>

          <div className="h-full glass-card rounded-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="font-display font-semibold text-lg">Recent Activity</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {recentTx.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <p className="text-sm">No transactions yet.</p>
                  <p className="text-xs mt-1">Select a vault on the map to start trading.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentTx.map(tx => {
                    const metal = metals.find(m => m.id === tx.metalId);
                    const isBuy = tx.type === 'buy';
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {isBuy ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{isBuy ? 'Bought' : 'Sold'} {metal?.name}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(tx.timestamp), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono">{parseFloat(tx.quantity).toFixed(2)} oz</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(tx.priceAtTime)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <VaultPanel 
        vault={selectedVault} 
        onClose={() => setSelectedVault(null)} 
      />
    </div>
  );
}
