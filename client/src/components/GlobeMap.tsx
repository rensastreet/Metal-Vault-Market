import React, { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import { useVaults } from "@/hooks/use-vaults";
import type { VaultResponse } from "@shared/routes";

// Using a reliable TopoJSON map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GlobeMapProps {
  onVaultSelect: (vault: VaultResponse) => void;
  hoverContent?: (vaultId: number) => React.ReactNode;
}

export default function GlobeMap({ onVaultSelect, hoverContent }: GlobeMapProps) {
  const { data: vaults = [] } = useVaults();
  const [hoveredVault, setHoveredVault] = useState<number | null>(null);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden glass-card">
      <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
        <p className="text-xs font-medium text-primary">Global Vault Network</p>
        <p className="text-xs text-muted-foreground">Select a location to trade</p>
      </div>
      
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        className="w-full h-full bg-background"
      >
        <ZoomableGroup center={[0, 20]} zoom={1} maxZoom={4}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1E1E24"
                  stroke="#2D2D35"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#25252D", outline: "none" },
                    pressed: { fill: "#1E1E24", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {vaults.map((vault) => {
            const isHovered = hoveredVault === vault.id;
            return (
              <Marker
                key={vault.id}
                coordinates={[parseFloat(vault.longitude), parseFloat(vault.latitude)]}
                onClick={() => onVaultSelect(vault)}
                onMouseEnter={() => setHoveredVault(vault.id)}
                onMouseLeave={() => setHoveredVault(null)}
                style={{
                  default: { outline: "none", cursor: "pointer" },
                  hover: { outline: "none", cursor: "pointer" },
                  pressed: { outline: "none", cursor: "pointer" }
                }}
              >
                <circle 
                  r={isHovered ? 8 : 4} 
                  fill={isHovered ? "#FFD700" : "#D4AF37"} 
                  className="transition-all duration-300"
                  style={{ filter: isHovered ? "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))" : "none" }}
                />
                <circle
                  r={isHovered ? 14 : 0}
                  fill="rgba(255, 215, 0, 0.2)"
                  className="transition-all duration-500"
                />
                
                {isHovered && (
                  <g>
                    <text
                      textAnchor="middle"
                      y={-15}
                      className="fill-white font-display text-xs font-semibold drop-shadow-md pointer-events-none"
                    >
                      {vault.name}
                    </text>
                    {hoverContent && (
                      <foreignObject x="-60" y="5" width="120" height="80" className="pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2 shadow-xl">
                          {hoverContent(vault.id)}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
