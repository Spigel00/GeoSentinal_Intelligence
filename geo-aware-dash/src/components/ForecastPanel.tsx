import { CloudRain, Sun, CloudLightning, Droplets } from "lucide-react";

export const ForecastPanel = () => {
  const forecast = [
    { day: "Today", icon: CloudRain, rain: "85mm", risk: "high" as const, temp: "22°C" },
    { day: "Tue", icon: CloudLightning, rain: "120mm", risk: "high" as const, temp: "20°C" },
    { day: "Wed", icon: CloudRain, rain: "65mm", risk: "medium" as const, temp: "21°C" },
    { day: "Thu", icon: Droplets, rain: "30mm", risk: "medium" as const, temp: "23°C" },
    { day: "Fri", icon: Sun, rain: "5mm", risk: "low" as const, temp: "26°C" },
  ];

  const riskDot = { low: "bg-risk-low", medium: "bg-risk-medium", high: "bg-risk-high" };

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <CloudRain className="w-3.5 h-3.5 text-accent" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
          5-Day Forecast
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {forecast.map((f) => (
          <div key={f.day} className="text-center bg-secondary/50 rounded p-1.5 border border-border/50">
            <span className="text-[8px] font-mono text-muted-foreground block">{f.day}</span>
            <f.icon className="w-4 h-4 mx-auto my-1 text-accent/70" />
            <span className="text-[9px] font-mono text-foreground block">{f.temp}</span>
            <span className="text-[7px] font-mono text-muted-foreground block">{f.rain}</span>
            <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${riskDot[f.risk]}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
