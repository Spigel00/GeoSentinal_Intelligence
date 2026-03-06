import { BarChart3 } from "lucide-react";

const MiniBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="h-full w-full flex items-end">
    <div className={`w-full rounded-t-sm ${color}`} style={{ height: `${(value / max) * 100}%` }} />
  </div>
);

export const AnalyticsCharts = () => {
  const rainfallData = [45, 62, 78, 55, 89, 72, 95, 68, 82, 57, 91, 74];
  const riskTrend = [15, 22, 35, 28, 45, 52, 48, 62, 55, 70, 65, 72];
  const maxRainfall = Math.max(...rainfallData);
  const maxRisk = Math.max(...riskTrend);
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-3.5 h-3.5 text-accent" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">Analytics</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Rainfall Chart */}
        <div>
          <span className="text-[8px] font-mono text-muted-foreground uppercase">Rainfall (mm)</span>
          <div className="flex items-end gap-0.5 h-16 mt-1">
            {rainfallData.map((v, i) => (
              <div key={i} className="flex-1 h-full flex flex-col items-center justify-end">
                <MiniBar value={v} max={maxRainfall} color="bg-accent/70" />
                <span className="text-[6px] font-mono text-muted-foreground mt-0.5">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Trend */}
        <div>
          <span className="text-[8px] font-mono text-muted-foreground uppercase">Risk Index</span>
          <div className="flex items-end gap-0.5 h-16 mt-1">
            {riskTrend.map((v, i) => (
              <div key={i} className="flex-1 h-full flex flex-col items-center justify-end">
                <MiniBar
                  value={v}
                  max={maxRisk}
                  color={v > 60 ? "bg-risk-high/70" : v > 35 ? "bg-risk-medium/70" : "bg-risk-low/70"}
                />
                <span className="text-[6px] font-mono text-muted-foreground mt-0.5">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {[
          { label: "Accuracy", value: "94.2%", color: "text-primary" },
          { label: "F1 Score", value: "0.91", color: "text-accent" },
          { label: "Precision", value: "0.93", color: "text-primary" },
          { label: "Recall", value: "0.89", color: "text-accent" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`font-mono text-sm font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[7px] font-mono text-muted-foreground uppercase">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
