import { MapPin, Radio, Droplets, Mountain, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskZone {
  id: string;
  name: string;
  risk: "low" | "medium" | "high";
  x: number;
  y: number;
  sensors: number;
  rainfall: number;
  soilMoisture: number;
  displacement: number;
}

export const RiskMap = ({ location }: { location: string }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  
  const zones: RiskZone[] = [
    { id: "1", name: "Zone A", risk: "high", x: 35, y: 25, sensors: 8, rainfall: 95, soilMoisture: 88, displacement: 12.4 },
    { id: "2", name: "Zone B", risk: "medium", x: 55, y: 40, sensors: 6, rainfall: 68, soilMoisture: 65, displacement: 4.2 },
    { id: "3", name: "Zone C", risk: "low", x: 25, y: 60, sensors: 5, rainfall: 42, soilMoisture: 45, displacement: 1.1 },
    { id: "4", name: "Zone D", risk: "high", x: 70, y: 30, sensors: 7, rainfall: 102, soilMoisture: 92, displacement: 15.8 },
    { id: "5", name: "Zone E", risk: "medium", x: 45, y: 70, sensors: 6, rainfall: 55, soilMoisture: 58, displacement: 3.7 },
    { id: "6", name: "Zone F", risk: "low", x: 65, y: 65, sensors: 4, rainfall: 38, soilMoisture: 42, displacement: 0.8 },
    { id: "7", name: "Zone G", risk: "high", x: 50, y: 15, sensors: 9, rainfall: 118, soilMoisture: 95, displacement: 18.2 },
  ];

  const riskColors = {
    low: "text-risk-low",
    medium: "text-risk-medium",
    high: "text-risk-high",
  };

  const riskBg = {
    low: "bg-risk-low/20",
    medium: "bg-risk-medium/20",
    high: "bg-risk-high/20 animate-pulse-glow",
  };

  return (
    <TooltipProvider>
      <div className="bg-card border border-border rounded-lg p-3 h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
              Landslide Risk Map
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[8px] font-mono text-primary">LIVE</span>
            </span>
          </div>
          <span className="font-mono text-[9px] text-muted-foreground">{location}</span>
        </div>

      {/* Map visualization */}
      <div className="relative bg-secondary/50 rounded-lg border border-border overflow-hidden aspect-[16/9]">
        {/* Grid overlay */}
        <div className="absolute inset-0 scanline opacity-50" />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Topographic-like lines */}
          <path d="M10,50 Q30,20 50,45 T90,35" fill="none" stroke="hsl(165 80% 45% / 0.1)" strokeWidth="0.3" />
          <path d="M5,60 Q25,35 55,55 T95,45" fill="none" stroke="hsl(165 80% 45% / 0.1)" strokeWidth="0.3" />
          <path d="M10,70 Q35,50 60,65 T90,55" fill="none" stroke="hsl(165 80% 45% / 0.1)" strokeWidth="0.3" />
          <path d="M5,80 Q30,65 55,75 T95,65" fill="none" stroke="hsl(165 80% 45% / 0.1)" strokeWidth="0.3" />
        </svg>

        {/* Risk zones */}
        {zones.map((zone) => (
          <Tooltip key={zone.id}>
            <TooltipTrigger>
              <div
                className={`absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all hover:scale-110 ${
                  selectedZone === zone.id ? "scale-125" : ""
                }`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
              >
                <div className={`w-6 h-6 rounded-full ${riskBg[zone.risk]} border-2 border-current ${riskColors[zone.risk]} flex items-center justify-center relative`}>
                  <div className={`w-2 h-2 rounded-full bg-current ${riskColors[zone.risk]}`} />
                  {zone.risk === "high" && (
                    <span className="absolute -top-0.5 -right-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-high"></span>
                      </span>
                    </span>
                  )}
                </div>
                <span className={`text-[7px] font-mono mt-0.5 font-semibold ${riskColors[zone.risk]}`}>{zone.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card/95 backdrop-blur-sm border-border p-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 border-b border-border pb-1">
                  <span className="font-mono text-xs font-bold text-foreground">{zone.name}</span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${riskBg[zone.risk]} ${riskColors[zone.risk]}`}>
                    {zone.risk.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-mono text-muted-foreground">Sensors:</span>
                  <span className="text-[9px] font-mono text-foreground font-semibold">{zone.sensors} active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3 h-3 text-accent" />
                  <span className="text-[9px] font-mono text-muted-foreground">Rainfall:</span>
                  <span className="text-[9px] font-mono text-foreground font-semibold">{zone.rainfall}mm/hr</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mountain className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-mono text-muted-foreground">Soil Moisture:</span>
                  <span className="text-[9px] font-mono text-foreground font-semibold">{zone.soilMoisture}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-risk-medium" />
                  <span className="text-[9px] font-mono text-muted-foreground">Displacement:</span>
                  <span className="text-[9px] font-mono text-foreground font-semibold">{zone.displacement}mm</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          {[
            { label: "Low", cls: "bg-risk-low", count: zones.filter(z => z.risk === "low").length },
            { label: "Medium", cls: "bg-risk-medium", count: zones.filter(z => z.risk === "medium").length },
            { label: "High", cls: "bg-risk-high", count: zones.filter(z => z.risk === "high").length },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${l.cls}`} />
              <span className="text-[8px] font-mono text-muted-foreground">{l.label}</span>
              <span className="text-[8px] font-mono text-foreground font-bold">({l.count})</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-primary" />
          <span className="text-[8px] font-mono text-muted-foreground">
            {zones.reduce((sum, z) => sum + z.sensors, 0)} sensors
          </span>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};
