import { CloudRain, Sun, CloudLightning, Droplets, Wind, AlertCircle } from "lucide-react";

export const ForecastPanel = () => {
  const forecast = [
    { day: "Today", icon: CloudRain, rain: "85mm", risk: "high" as const, temp: "22°C", wind: "15km/h", warning: true },
    { day: "Tue", icon: CloudLightning, rain: "120mm", risk: "high" as const, temp: "20°C", wind: "22km/h", warning: true },
    { day: "Wed", icon: CloudRain, rain: "65mm", risk: "medium" as const, temp: "21°C", wind: "18km/h", warning: false },
    { day: "Thu", icon: Droplets, rain: "30mm", risk: "medium" as const, temp: "23°C", wind: "12km/h", warning: false },
    { day: "Fri", icon: Sun, rain: "5mm", risk: "low" as const, temp: "26°C", wind: "8km/h", warning: false },
  ];

  const riskDot = { low: "bg-risk-low", medium: "bg-risk-medium", high: "bg-risk-high" };
  const totalRainfall = forecast.reduce((sum, f) => sum + parseInt(f.rain), 0);
  const highRiskDays = forecast.filter(f => f.risk === "high").length;

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CloudRain className="w-3.5 h-3.5 text-accent" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
            5-Day Forecast
          </span>
        </div>
        {highRiskDays > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-risk-high/20">
            <AlertCircle className="w-2.5 h-2.5 text-risk-high" />
            <span className="text-[8px] font-mono text-risk-high font-bold">
              {highRiskDays} HIGH RISK
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {forecast.map((f) => (
          <div key={f.day} className={`text-center bg-secondary/50 rounded p-1.5 border transition-all hover:scale-105 ${
            f.warning ? "border-risk-high/50 ring-1 ring-risk-high/20" : "border-border/50"
          }`}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[8px] font-mono text-muted-foreground">{f.day}</span>
              {f.warning && <AlertCircle className="w-2 h-2 text-risk-high" />}
            </div>
            <f.icon className="w-4 h-4 mx-auto my-1 text-accent/70" />
            <span className="text-[9px] font-mono text-foreground font-semibold block">{f.temp}</span>
            <div className="flex items-center justify-center gap-0.5 my-0.5">
              <Droplets className="w-2 h-2 text-accent/50" />
              <span className="text-[7px] font-mono text-muted-foreground">{f.rain}</span>
            </div>
            <div className="flex items-center justify-center gap-0.5 mb-1">
              <Wind className="w-2 h-2 text-muted-foreground/50" />
              <span className="text-[7px] font-mono text-muted-foreground">{f.wind}</span>
            </div>
            <div className={`w-2 h-2 rounded-full mx-auto ${riskDot[f.risk]}`} />
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-2 pt-2 border-t border-border grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-[9px] font-mono font-bold text-accent">{totalRainfall}mm</div>
          <div className="text-[7px] font-mono text-muted-foreground">Total Rain</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] font-mono font-bold text-risk-high">{highRiskDays}/5</div>
          <div className="text-[7px] font-mono text-muted-foreground">High Risk</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] font-mono font-bold text-primary">94%</div>
          <div className="text-[7px] font-mono text-muted-foreground">Accuracy</div>
        </div>
      </div>
    </div>
  );
};
