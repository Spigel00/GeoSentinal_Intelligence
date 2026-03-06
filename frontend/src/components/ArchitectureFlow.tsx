import { Database, Cloud, Cpu, BarChart3, AlertTriangle, ArrowDown, ArrowRight, Satellite, Droplets, Mountain, Radio } from "lucide-react";

const FlowNode = ({ icon: Icon, title, items, color = "primary" }: {
  icon: React.ElementType;
  title: string;
  items: string[];
  color?: "primary" | "accent" | "risk-medium" | "risk-high";
}) => {
  const colorMap = {
    primary: "border-primary/30 text-primary",
    accent: "border-accent/30 text-accent",
    "risk-medium": "border-risk-medium/30 text-risk-medium",
    "risk-high": "border-risk-high/30 text-risk-high",
  };

  const iconColorMap = {
    primary: "text-primary",
    accent: "text-accent",
    "risk-medium": "text-risk-medium",
    "risk-high": "text-risk-high",
  };

  return (
    <div className={`flow-node ${colorMap[color]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColorMap[color]}`} />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
            <span className={`w-1 h-1 rounded-full bg-current ${iconColorMap[color]} opacity-60`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const FlowArrow = ({ direction = "down" }: { direction?: "down" | "right" }) => (
  <div className="flex items-center justify-center py-1">
    {direction === "down" ? (
      <div className="flex flex-col items-center">
        <div className="w-px h-4 bg-primary/40" />
        <ArrowDown className="w-3 h-3 text-primary/60" />
      </div>
    ) : (
      <div className="flex items-center">
        <div className="h-px w-4 bg-primary/40" />
        <ArrowRight className="w-3 h-3 text-primary/60" />
      </div>
    )}
  </div>
);

export const ArchitectureFlow = () => {
  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="font-mono text-sm font-bold text-primary tracking-wider uppercase">
          System Architecture
        </h2>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">GeoSentinel v2.4 • Pipeline Flow</p>
      </div>

      {/* Data Sources */}
      <div className="space-y-2">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Data Sources</span>
        <div className="grid grid-cols-2 gap-2">
          <FlowNode icon={Satellite} title="Satellite" items={["InSAR Displacement", "Optical Imagery", "SAR Backscatter"]} />
          <FlowNode icon={Droplets} title="Weather" items={["Rainfall Intensity", "Soil Moisture", "Temperature"]} />
          <FlowNode icon={Mountain} title="Terrain" items={["Slope Gradient", "Soil Type", "Land Cover"]} />
          <FlowNode icon={Radio} title="IoT Sensors" items={["Piezometers", "Inclinometers", "Tilt Sensors"]} />
        </div>
      </div>

      <FlowArrow />

      {/* Data Processing */}
      <FlowNode icon={Database} title="Data Processing" items={["Feature Engineering", "Normalization & Cleaning", "Temporal Aggregation", "Spatial Interpolation"]} color="accent" />

      <FlowArrow />

      {/* XGBoost Model */}
      <FlowNode icon={Cpu} title="XGBoost Model" items={["Multi-class Classification", "Probability Calibration", "Feature Importance", "Real-time Inference"]} color="risk-medium" />

      <FlowArrow />

      {/* System Outputs */}
      <div className="space-y-2">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">System Outputs</span>
        <div className="grid grid-cols-2 gap-2">
          <FlowNode icon={AlertTriangle} title="Risk Alerts" items={["Real-time Warnings", "SMS/Email Dispatch", "Escalation Protocol"]} color="risk-high" />
          <FlowNode icon={BarChart3} title="Analytics" items={["Risk Heatmaps", "Trend Analysis", "Model Metrics"]} color="accent" />
          <FlowNode icon={Cloud} title="API Services" items={["REST Endpoints", "WebSocket Stream", "Third-party Hooks"]} />
          <FlowNode icon={Database} title="Storage" items={["Time-series DB", "Geospatial Index", "Audit Logs"]} />
        </div>
      </div>
    </div>
  );
};
