import { MapPin } from "lucide-react";

interface RiskZone {
  id: string;
  name: string;
  risk: "low" | "medium" | "high";
  x: number;
  y: number;
}

export const RiskMap = ({ location }: { location: string }) => {
  const zones: RiskZone[] = [
    { id: "1", name: "Zone A", risk: "high", x: 35, y: 25 },
    { id: "2", name: "Zone B", risk: "medium", x: 55, y: 40 },
    { id: "3", name: "Zone C", risk: "low", x: 25, y: 60 },
    { id: "4", name: "Zone D", risk: "high", x: 70, y: 30 },
    { id: "5", name: "Zone E", risk: "medium", x: 45, y: 70 },
    { id: "6", name: "Zone F", risk: "low", x: 65, y: 65 },
    { id: "7", name: "Zone G", risk: "high", x: 50, y: 15 },
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
    <div className="bg-card border border-border rounded-lg p-3 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
            Landslide Risk Map
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
          <div
            key={zone.id}
            className={`absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group`}
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
          >
            <div className={`w-6 h-6 rounded-full ${riskBg[zone.risk]} border border-current ${riskColors[zone.risk]} flex items-center justify-center`}>
              <div className={`w-2 h-2 rounded-full bg-current ${riskColors[zone.risk]}`} />
            </div>
            <span className={`text-[7px] font-mono mt-0.5 ${riskColors[zone.risk]}`}>{zone.name}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2">
        {[
          { label: "Low", cls: "bg-risk-low" },
          { label: "Medium", cls: "bg-risk-medium" },
          { label: "High", cls: "bg-risk-high" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${l.cls}`} />
            <span className="text-[8px] font-mono text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
