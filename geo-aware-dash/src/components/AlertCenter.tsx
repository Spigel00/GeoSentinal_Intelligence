import { AlertTriangle, Bell, Clock, Filter, Download, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  severity: "low" | "medium" | "high";
  message: string;
  time: string;
  zone: string;
  acknowledged: boolean;
}

export const AlertCenter = () => {
  const [filterSeverity, setFilterSeverity] = useState<"all" | "low" | "medium" | "high">("all");
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "1", severity: "high", message: "Critical slope displacement detected", time: "2m ago", zone: "Zone A", acknowledged: false },
    { id: "2", severity: "high", message: "Rainfall threshold exceeded (120mm/hr)", time: "8m ago", zone: "Zone D", acknowledged: false },
    { id: "3", severity: "medium", message: "Soil moisture anomaly rising", time: "15m ago", zone: "Zone B", acknowledged: false },
    { id: "4", severity: "medium", message: "Piezometer readings elevated", time: "32m ago", zone: "Zone E", acknowledged: true },
    { id: "5", severity: "low", message: "Routine sensor calibration needed", time: "1h ago", zone: "Zone C", acknowledged: true },
    { id: "6", severity: "high", message: "Sensor network degraded in target area", time: "45m ago", zone: "Zone G", acknowledged: false },
  ]);

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity) return false;
    if (!showAcknowledged && alert.acknowledged) return false;
    return true;
  });

  const toggleAcknowledge = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, acknowledged: !alert.acknowledged } : alert
    ));
  };

  const exportAlerts = () => {
    const data = alerts.map(a => `${a.time},${a.severity},${a.zone},${a.message}`).join('\n');
    const blob = new Blob([`Time,Severity,Zone,Message\n${data}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${new Date().toISOString()}.csv`;
    a.click();
  };

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
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-risk-high/20 text-risk-high">
            {alerts.filter((a) => a.severity === "high" && !a.acknowledged).length} Critical
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0"
            onClick={exportAlerts}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border">
        <Filter className="w-3 h-3 text-muted-foreground" />
        <div className="flex gap-1">
          {(["all", "high", "medium", "low"] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                filterSeverity === severity
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {severity.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAcknowledged(!showAcknowledged)}
          className={`text-[8px] font-mono px-1.5 py-0.5 rounded ml-auto transition-colors ${
            showAcknowledged
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
          }`}
        >
          {showAcknowledged ? "HIDE ACK" : "SHOW ACK"}
        </button>
      </div>

      <div className="space-y-1.5 max-h-52 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-4 text-[9px] font-mono text-muted-foreground">
            No alerts to display
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-2 ${severityStyles[alert.severity]} rounded-r px-2 py-1.5 transition-opacity ${
                alert.acknowledged ? "opacity-50" : ""
              }`}
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
                <button
                  onClick={() => toggleAcknowledge(alert.id)}
                  className={`flex-shrink-0 transition-colors ${
                    alert.acknowledged ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                  title={alert.acknowledged ? "Mark as unacknowledged" : "Acknowledge alert"}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <span className="text-[8px] font-mono text-muted-foreground">
          Total: {alerts.length} | Active: {alerts.filter(a => !a.acknowledged).length}
        </span>
        <span className="text-[8px] font-mono text-muted-foreground">
          Last updated: <span className="text-foreground">Now</span>
        </span>
      </div>
    </div>
  );
};
