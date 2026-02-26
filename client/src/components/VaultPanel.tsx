import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Layers } from "lucide-react";
import type { VaultResponse, MetalResponse } from "@shared/routes";
import { useMetals } from "@/hooks/use-metals";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { usePortfolio } from "@/hooks/use-portfolio";
import { formatCurrency } from "@/lib/utils";
import { Button } from "./ui/button";

interface VaultPanelProps {
  vault: VaultResponse | null;
  onClose: () => void;
}

export default function VaultPanel({ vault, onClose }: VaultPanelProps) {
  const { data: metals = [] } = useMetals();
  const { data: portfolio = [] } = usePortfolio();
  const createTransaction = useCreateTransaction();
  
  const [selectedMetal, setSelectedMetal] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vault || !selectedMetal || !quantity || parseFloat(quantity) <= 0) return;

    createTransaction.mutate({
      vaultId: vault.id,
      metalId: selectedMetal,
      type: tradeType,
      quantity: quantity
    }, {
      onSuccess: () => {
        setQuantity("");
      }
    });
  };

  const getMetalHoldings = (metalId: number) => {
    if (!vault) return 0;
    const holding = portfolio.find(p => p.vaultId === vault.id && p.metalId === metalId);
    return holding ? parseFloat(holding.quantity) : 0;
  };

  return (
    <AnimatePresence>
      {vault && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed md:absolute top-0 right-0 bottom-0 w-full md:w-[400px] bg-card border-l border-border/50 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">{vault.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm">
                    <Layers className="w-3 h-3" /> {vault.location} Vault
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Markets */}
              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Available Metals</h3>
                {metals.map(metal => {
                  const isSelected = selectedMetal === metal.id;
                  const holdings = getMetalHoldings(metal.id);
                  
                  return (
                    <div 
                      key={metal.id}
                      onClick={() => setSelectedMetal(metal.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                        isSelected 
                          ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]" 
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-display font-bold text-lg ${
                              metal.symbol === 'XAU' ? 'text-yellow-400' :
                              metal.symbol === 'XAG' ? 'text-slate-300' : 'text-zinc-300'
                            }`}>{metal.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-black/30 text-muted-foreground">{metal.symbol}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatCurrency(metal.currentPrice)} / oz
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Your Vault Balance</p>
                          <p className="font-mono font-medium">{holdings.toFixed(2)} oz</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trading Form */}
              <AnimatePresence>
                {selectedMetal && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-card rounded-2xl p-5"
                    onSubmit={handleTrade}
                  >
                    <div className="flex bg-black/40 p-1 rounded-lg mb-5">
                      <button
                        type="button"
                        onClick={() => setTradeType("buy")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                          tradeType === "buy" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeType("sell")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                          tradeType === "sell" ? "bg-red-500/20 text-red-400" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Sell
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Quantity (oz)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.01"
                            min="0.01"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-foreground font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            placeholder="0.00"
                          />
                          <span className="absolute right-4 top-3 text-muted-foreground text-sm">oz</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          disabled={createTransaction.isPending || !quantity}
                          className="w-full"
                          variant={tradeType === "buy" ? "premium" : "outline"}
                        >
                          {createTransaction.isPending ? "Processing..." : `${tradeType === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}`}
                        </Button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
