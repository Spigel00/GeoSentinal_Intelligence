import { Activity, Wifi, HardDrive, Cpu, Server } from "lucide-react";

interface StatusItem {
  name: string;
  icon: React.ElementType;
  status: "operational" | "degraded" | "critical";
  uptime: string;
  load?: string;
}

export const InfrastructureStatus = () => {
  const items: StatusItem[] = [
    { name: "Sensor Network", icon: Wifi, status: "operational", uptime: "99.8%", load: "142/150" },
    { name: "Processing Node", icon: Cpu, status: "operational", uptime: "99.9%", load: "67%" },
    { name: "Database Cluster", icon: HardDrive, status: "degraded", uptime: "98.2%", load: "89%" },
    { name: "API Gateway", icon: Server, status: "operational", uptime: "99.7%", load: "34%" },
  ];

  const statusColors = {
    operational: { dot: "bg-risk-low", text: "text-risk-low", label: "OK" },
    degraded: { dot: "bg-risk-medium", text: "text-risk-medium", label: "WARN" },
    critical: { dot: "bg-risk-high animate-pulse", text: "text-risk-high", label: "CRIT" },
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-3.5 h-3.5 text-primary" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
          Infrastructure
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => {
          const s = statusColors[item.status];
          return (
            <div key={item.name} className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1 border border-border/50">
              <item.icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] font-mono flex-1">{item.name}</span>
              {item.load && (
                <span className="text-[8px] font-mono text-muted-foreground">{item.load}</span>
              )}
              <span className={`text-[7px] font-mono font-bold ${s.text}`}>{s.label}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
