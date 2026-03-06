import { useMetals } from "@/hooks/use-metals";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useState, useMemo } from "react";
import { Newspaper, TrendingUp, Globe, Zap } from "lucide-react";

// Mock historical data generator for visualization
const generateHistory = (basePrice: number) => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    price: basePrice + (Math.random() - 0.5) * (basePrice * 0.05)
  }));
};

const NEWS_ITEMS = [
  {
    id: 1,
    title: "Global Central Banks Increase Gold Reserves",
    source: "Market Insights",
    time: "2h ago",
    category: "Macro",
    impact: "High"
  },
  {
    id: 2,
    title: "New Neodymium Deposits Discovered in Nordic Region",
    source: "Tech Metals Daily",
    time: "5h ago",
    category: "Rare Earths",
    impact: "Medium"
  },
  {
    id: 3,
    title: "Silver Industrial Demand Hits 10-Year High",
    source: "Commodity Watch",
    time: "8h ago",
    category: "Industrial",
    impact: "High"
  },
  {
    id: 4,
    title: "Diamond Standard Tokenization Gains Institutional Interest",
    source: "Financial Times",
    time: "12h ago",
    category: "Commodities",
    impact: "Medium"
  }
];

export default function MarketInsights() {
  const { data: metals = [] } = useMetals();
  const [selectedMetalId, setSelectedMetalId] = useState<number | null>(null);

  const activeMetal = useMemo(() => 
    metals.find(m => m.id === (selectedMetalId ?? metals[0]?.id)),
    [metals, selectedMetalId]
  );

  const chartData = useMemo(() => 
    activeMetal ? generateHistory(parseFloat(activeMetal.currentPrice)) : [],
    [activeMetal]
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <Card className="lg:col-span-2 glass-card border-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
            <div>
              <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Price Performance
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">24h Historical Market Data (USD)</p>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {metals.map(metal => (
                <button
                  key={metal.id}
                  onClick={() => setSelectedMetalId(metal.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    (selectedMetalId ?? metals[0]?.id) === metal.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {metal.symbol}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {activeMetal && (
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-display font-bold">{formatCurrency(activeMetal.currentPrice)}</span>
                  <span className="text-emerald-500 text-sm font-bold">+1.24% (24h)</span>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis 
                        hide 
                        domain={['dataMin - 10', 'dataMax + 10']}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: any) => [formatCurrency(value), 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="var(--primary)" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* News Feed */}
        <Card className="glass-card border-none flex flex-col">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              Market Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y divide-white/5">
              {NEWS_ITEMS.map(item => (
                <div key={item.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                      {item.category}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{item.time}</span>
                  </div>
                  <h4 className="text-sm font-medium leading-tight mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {item.source}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      item.impact === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                    }`}>
                      {item.impact} Impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5">
              <button className="w-full py-2 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all">
                View Global Bulletin
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Sentiment / Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Market Sentiment</p>
            <p className="font-display font-bold">Bullish (74%)</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-l-4 border-primary">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Global Volume</p>
            <p className="font-display font-bold">$12.4B (24h)</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-l-4 border-white/20">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Volatility Index</p>
            <p className="font-display font-bold">Low (1.2%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
