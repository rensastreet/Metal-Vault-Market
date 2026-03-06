import { useState, useMemo } from "react";
import GlobeMap from "@/components/GlobeMap";
import VaultPanel from "@/components/VaultPanel";
import MarketInsights from "@/components/MarketInsights";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useMetals } from "@/hooks/use-metals";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import type { VaultResponse } from "@shared/routes";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Activity, Globe } from "lucide-react";

export default function Dashboard() {
  const [selectedVault, setSelectedVault] = useState<VaultResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"marketplace" | "insights">("marketplace");
  
  const { data: portfolio = [], isLoading: pLoading } = usePortfolio();
  const { data: metals = [], isLoading: mLoading } = useMetals();
  const { data: transactions = [], isLoading: tLoading } = useTransactions();

  if (pLoading || mLoading || tLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-display font-medium text-primary/60 tracking-widest animate-pulse uppercase">Establishing Secure Connection</p>
        </div>
      </div>
    );
  }

  // Calculate total portfolio value safely
  const totalValue = (portfolio || []).reduce((acc, item) => {
    const metal = (metals || []).find(m => m.id === item.metalId);
    if (!metal) return acc;
    const quantity = parseFloat(item.quantity);
    const price = parseFloat(metal.currentPrice);
    if (isNaN(quantity) || isNaN(price)) return acc;
    return acc + (quantity * price);
  }, 0);

  const recentTx = [...(transactions || [])].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Global Terminal</h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
              Access the world's most secure commodity marketplace and real-time market intelligence.
            </p>
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-xl self-start md:self-auto border border-white/5">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === "marketplace" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === "insights" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Insights
            </button>
          </div>
        </div>

        {activeTab === "marketplace" ? (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
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
                  <h3 className="text-xl font-display font-bold mb-4">Market Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="font-semibold text-primary">Instant Settlement</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">Trades are executed against physical liquidity and settled instantly to your vault sub-account.</p>
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                       <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Portfolio Value</p>
                       <p className="text-3xl font-display font-bold text-primary">{formatCurrency(totalValue)}</p>
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
        ) : (
          <MarketInsights />
        )}

      </div>

      <VaultPanel 
        vault={selectedVault} 
        onClose={() => setSelectedVault(null)} 
      />
    </div>
  );
}
