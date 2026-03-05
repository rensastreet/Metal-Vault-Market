import { usePortfolio } from "@/hooks/use-portfolio";
import { useMetals } from "@/hooks/use-metals";
import { useVaults } from "@/hooks/use-vaults";
import { formatCurrency } from "@/lib/utils";
import GlobeMap from "@/components/GlobeMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Portfolio() {
  const { data: portfolio = [], isLoading: pLoading } = usePortfolio();
  const { data: metals = [], isLoading: mLoading } = useMetals();
  const { data: vaults = [] } = useVaults();

  if (pLoading || mLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const holdings = (portfolio || []).map(item => {
    const metal = metals.find(m => m.id === item.metalId);
    const vault = vaults.find(v => v.id === item.vaultId);
    const value = parseFloat(item.quantity) * parseFloat(metal?.currentPrice || "0");
    return { ...item, metal, vault, value };
  });

  const totalValue = holdings.reduce((acc, h) => acc + h.value, 0);

  const chartData = holdings.reduce((acc: any[], h) => {
    const existing = acc.find(item => item.name === h.metal?.name);
    if (existing) {
      existing.value += h.value;
    } else {
      acc.push({ name: h.metal?.name, value: h.value });
    }
    return acc;
  }, []);

  const COLORS = ["#D4AF37", "#C0C0C0", "#E5E4E2", "#A9A9A9"];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-display font-bold">Account Statement</h1>
        <p className="text-muted-foreground mt-1">Detailed breakdown of your global physical holdings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none flex flex-col justify-center text-center p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Net Worth</p>
          <h2 className="text-4xl font-display font-bold text-primary">{formatCurrency(totalValue)}</h2>
          <div className="mt-6 space-y-2 text-left">
            {chartData.map((item, i) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono">{((item.value / totalValue) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Vault Allocation Map</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] p-0 overflow-hidden rounded-b-xl">
          <GlobeMap 
            onVaultSelect={() => {}} 
            hoverContent={(vaultId) => {
              const vaultHoldings = holdings.filter(h => h.vaultId === vaultId);
              if (vaultHoldings.length === 0) return <p className="text-[10px] text-muted-foreground text-center">No holdings here</p>;
              return (
                <div className="space-y-1">
                  {vaultHoldings.map((h, i) => (
                    <div key={i} className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-medium text-white">{h.metal?.symbol}</span>
                      <span className="text-[10px] font-mono text-primary">{parseFloat(h.quantity).toFixed(2)} oz</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </CardContent>
      </Card>

      <Card className="glass-card border-none overflow-hidden">
        <CardHeader>
          <CardTitle>Detailed Holdings</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead>Asset</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Value (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No active holdings found.
                </TableCell>
              </TableRow>
            ) : (
              holdings.map((h, i) => (
                <TableRow key={i} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className={h.metal?.symbol === 'XAU' ? 'text-yellow-500' : 'text-slate-400'}>
                        {h.metal?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{h.vault?.name}</TableCell>
                  <TableCell className="text-right font-mono">{parseFloat(h.quantity).toFixed(3)} oz</TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary">{formatCurrency(h.value)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
