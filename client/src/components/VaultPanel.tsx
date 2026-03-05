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

  const isDelaware = vault?.name.includes("Delaware");
  const filteredMetals = metals.filter(m => 
    isDelaware ? m.symbol === "DSD" : m.symbol !== "DSD"
  );
  
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
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
                    {isDelaware ? "Commodity Inventory" : "Current Inventory"}
                  </h3>
                  <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    {isDelaware ? "Direct via Diamond Standard" : "Spot + 0.5% Premium"}
                  </span>
                </div>
                {filteredMetals.map(metal => {
                  const isSelected = selectedMetal === metal.id;
                  const holdings = getMetalHoldings(metal.id);
                  
                  return (
                    <div 
                      key={metal.id}
                      onClick={() => {
                        setSelectedMetal(metal.id);
                        setTradeType("buy");
                      }}
                      className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]" 
                          : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                            isSelected ? "bg-black/20" : "bg-black/40"
                          }`}>
                            {metal.symbol.slice(1, 2)}
                          </div>
                          <div>
                            <p className={`font-display font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                              {metal.name}
                            </p>
                            <p className={`text-xs ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {metal.symbol} • {isDelaware ? "Certified Diamond Standard" : "Physical Bullion"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono font-bold ${isSelected ? "text-primary-foreground" : "text-primary"}`}>
                            {formatCurrency(metal.currentPrice)}
                          </p>
                          <p className={`text-[10px] uppercase tracking-tighter ${isSelected ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            Your Balance: {holdings.toFixed(2)} oz
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trading Form */}
              <AnimatePresence mode="wait">
                {selectedMetal ? (
                  <motion.form 
                    key="trade-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card rounded-3xl p-6 border-primary/20 bg-primary/5"
                    onSubmit={handleTrade}
                  >
                    <div className="flex bg-black/40 p-1.5 rounded-xl mb-6">
                      <button
                        type="button"
                        onClick={() => setTradeType("buy")}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                          tradeType === "buy" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Acquire
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeType("sell")}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                          tradeType === "sell" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Liquidate
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Quantity</label>
                          <span className="text-[10px] font-mono text-primary">Available: {tradeType === 'buy' ? 'Unlimited' : `${getMetalHoldings(selectedMetal).toFixed(3)} oz`}</span>
                        </div>
                        <div className="relative group">
                          <input 
                            type="number" 
                            step={isDelaware ? "1" : "0.001"}
                            min={isDelaware ? "1" : "0.001"}
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-xl text-foreground font-mono focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                            placeholder={isDelaware ? "0" : "0.000"}
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                            {isDelaware ? "UNITS" : "OZ"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-black/20 rounded-2xl p-4 space-y-2 border border-white/5">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                          <span>Estimated Total</span>
                          <span>Secured Settlement</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-2xl font-display font-bold text-foreground">
                            {quantity ? formatCurrency(parseFloat(quantity) * parseFloat(filteredMetals.find(m => m.id === selectedMetal)?.currentPrice || "0")) : "$0.00"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <TrendingUp className="w-3 h-3" />
                            INSTANT
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          disabled={createTransaction.isPending || !quantity}
                          className="w-full py-7 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/10"
                          variant={tradeType === "buy" ? "premium" : "outline"}
                        >
                          {createTransaction.isPending ? "Transacting..." : `Confirm ${tradeType === 'buy' ? 'Acquisition' : 'Liquidation'}`}
                        </Button>
                        <p className="text-[9px] text-center text-muted-foreground mt-4 leading-relaxed px-4">
                          {isDelaware 
                            ? "By confirming, you authorize Rensa Street to acquire Diamond Standard certified commodities to be held in your Delaware sub-account."
                            : "By confirming, you authorize Rensa Street to execute this physical trade and allocate holdings to your private vault sub-account."}
                        </p>
                      </div>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-12 border-2 border-dashed border-white/5 rounded-3xl"
                  >
                    <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-xs text-muted-foreground font-medium">Select an asset above to view<br/>pricing and execute a trade.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
