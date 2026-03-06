import { AlertTriangle, Bell, Clock } from "lucide-react";

interface Alert {
  id: string;
  severity: "low" | "medium" | "high";
  message: string;
  time: string;
  zone: string;
}

export const AlertCenter = () => {
  const alerts: Alert[] = [
    { id: "1", severity: "high", message: "Critical slope displacement detected", time: "2m ago", zone: "Zone A" },
    { id: "2", severity: "high", message: "Rainfall threshold exceeded (120mm/hr)", time: "8m ago", zone: "Zone D" },
    { id: "3", severity: "medium", message: "Soil moisture anomaly rising", time: "15m ago", zone: "Zone B" },
    { id: "4", severity: "medium", message: "Piezometer readings elevated", time: "32m ago", zone: "Zone E" },
    { id: "5", severity: "low", message: "Routine sensor calibration needed", time: "1h ago", zone: "Zone C" },
  ];

  const severityStyles = {
    high: "border-l-risk-high risk-bg-high",
    medium: "border-l-risk-medium risk-bg-medium",
    low: "border-l-risk-low risk-bg-low",
  };

  const iconColor = {
    high: "text-risk-high",
    medium: "text-risk-medium",
    low: "text-risk-low",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-risk-high" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-risk-high">
            Alert Center
          </span>
        </div>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-risk-high/20 text-risk-high">
          {alerts.filter((a) => a.severity === "high").length} Critical
        </span>
      </div>

      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-2 ${severityStyles[alert.severity]} rounded-r px-2 py-1.5`}
          >
            <div className="flex items-start gap-1.5">
              <AlertTriangle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${iconColor[alert.severity]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono leading-tight">{alert.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] font-mono text-muted-foreground">{alert.zone}</span>
                  <Clock className="w-2 h-2 text-muted-foreground" />
                  <span className="text-[8px] font-mono text-muted-foreground">{alert.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
