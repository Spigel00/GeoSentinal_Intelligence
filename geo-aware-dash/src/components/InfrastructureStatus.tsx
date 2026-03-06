import { Activity, Wifi, HardDrive, Cpu, Server, Database, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StatusItem {
  name: string;
  icon: React.ElementType;
  status: "operational" | "degraded" | "critical";
  uptime: string;
  load?: string;
  loadPercent?: number;
}

export const InfrastructureStatus = () => {
  const items: StatusItem[] = [
    { name: "Sensor Network", icon: Wifi, status: "operational", uptime: "99.8%", load: "142/150", loadPercent: 95 },
    { name: "Processing Node", icon: Cpu, status: "operational", uptime: "99.9%", load: "67%", loadPercent: 67 },
    { name: "Database Cluster", icon: HardDrive, status: "degraded", uptime: "98.2%", load: "89%", loadPercent: 89 },
    { name: "API Gateway", icon: Server, status: "operational", uptime: "99.7%", load: "34%", loadPercent: 34 },
    { name: "ML Model Service", icon: Zap, status: "operational", uptime: "99.6%", load: "52%", loadPercent: 52 },
    { name: "Data Pipeline", icon: Database, status: "operational", uptime: "99.5%", load: "71%", loadPercent: 71 },
  ];

  const statusColors = {
    operational: { dot: "bg-risk-low", text: "text-risk-low", label: "OK", border: "border-risk-low/30" },
    degraded: { dot: "bg-risk-medium", text: "text-risk-medium", label: "WARN", border: "border-risk-medium/30" },
    critical: { dot: "bg-risk-high animate-pulse", text: "text-risk-high", label: "CRIT", border: "border-risk-high/30" },
  };

  const operationalCount = items.filter(i => i.status === "operational").length;
  const degradedCount = items.filter(i => i.status === "degraded").length;
  const criticalCount = items.filter(i => i.status === "critical").length;

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
            Infrastructure
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-risk-low">{operationalCount} OK</span>
          {degradedCount > 0 && <span className="text-[8px] font-mono text-risk-medium">{degradedCount} WARN</span>}
          {criticalCount > 0 && <span className="text-[8px] font-mono text-risk-high">{criticalCount} CRIT</span>}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const s = statusColors[item.status];
          return (
            <div key={item.name} className={`bg-secondary/30 rounded px-2.5 py-2 border ${s.border} transition-all hover:scale-[1.01]`}>
              <div className="flex items-center gap-2 mb-1.5">
                <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[9px] font-mono font-semibold flex-1">{item.name}</span>
                <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${s.text} bg-secondary`}>
                  {s.label}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              </div>
              {item.loadPercent !== undefined && (
                <div className="space-y-0.5 ml-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono text-muted-foreground">Load: {item.load}</span>
                    <span className="text-[8px] font-mono text-muted-foreground">Uptime: {item.uptime}</span>
                  </div>
                  <Progress 
                    value={item.loadPercent} 
                    className="h-1.5" 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* System Health Summary */}
      <div className="mt-3 pt-2 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[9px] font-mono font-bold text-primary">99.7%</div>
            <div className="text-[7px] font-mono text-muted-foreground">Avg Uptime</div>
          </div>
          <div>
            <div className="text-[9px] font-mono font-bold text-accent">62%</div>
            <div className="text-[7px] font-mono text-muted-foreground">Avg Load</div>
          </div>
          <div>
            <div className="text-[9px] font-mono font-bold text-risk-low">Healthy</div>
            <div className="text-[7px] font-mono text-muted-foreground">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};
