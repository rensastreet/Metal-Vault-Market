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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Global Marketplace</h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
              Secure your wealth across 10 strategic global jurisdictions. Select a vault on the map to start your next acquisition.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Portfolio</p>
              <p className="text-2xl font-display font-bold text-primary">{pLoading ? "..." : formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>

        {/* Market Ticker */}
        <div className="glass-card p-4 rounded-2xl border border-primary/10 overflow-hidden">
           <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
             <div className="flex-shrink-0 flex items-center gap-2 pr-6 border-r border-white/10">
               <Activity className="w-4 h-4 text-primary animate-pulse" />
               <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Spot Prices</span>
             </div>
             {metals.map(metal => (
               <div key={metal.id} className="flex items-center gap-3 flex-shrink-0 min-w-[140px]">
                 <span className="text-xs font-medium text-muted-foreground">{metal.symbol}</span>
                 <span className="font-mono font-bold">{formatCurrency(metal.currentPrice)}</span>
                 <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">+0.2%</span>
               </div>
             ))}
           </div>
        </div>

        {/* Map Focus Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="h-[600px] rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl bg-black/20">
             <GlobeMap onVaultSelect={setSelectedVault} />
          </div>
        </div>

        {/* Bottom Context Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-display font-bold mb-4">Why Rensa Street?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="font-semibold text-primary">Instant Settlement</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">Trades are executed against physical liquidity and settled instantly to your vault sub-account.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-primary">Full Insurance</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">Every ounce stored via Rensa Street is 100% insured by Lloyd's of London and audited quarterly.</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="glass-card rounded-3xl flex flex-col overflow-hidden border border-white/5">
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="font-display font-semibold">Activity Audit</h3>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {recentTx.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center opacity-50">
                  <p className="text-xs italic tracking-wide">Awaiting your first global allocation...</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentTx.map(tx => {
                    const metal = metals.find(m => m.id === tx.metalId);
                    const isBuy = tx.type === 'buy';
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {isBuy ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">{isBuy ? 'Bought' : 'Sold'} {metal?.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{format(new Date(tx.timestamp), "MMM d HH:mm")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold tracking-tighter">{parseFloat(tx.quantity).toFixed(3)}</p>
                          <p className="text-[10px] text-muted-foreground">{formatCurrency(tx.priceAtTime)}</p>
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
