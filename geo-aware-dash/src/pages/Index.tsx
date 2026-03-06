import { useState } from "react";
import { Shield, Clock } from "lucide-react";
import { ArchitectureFlow } from "@/components/ArchitectureFlow";
import { LocationInput } from "@/components/LocationInput";
import { RiskMap } from "@/components/RiskMap";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { AlertCenter } from "@/components/AlertCenter";
import { ForecastPanel } from "@/components/ForecastPanel";
import { InfrastructureStatus } from "@/components/InfrastructureStatus";

const Index = () => {
  const [location, setLocation] = useState("Munnar, Kerala");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-mono text-sm font-bold text-foreground tracking-wide">
              GEO<span className="text-primary">SENTINEL</span>
            </h1>
            <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
              Landslide Early Warning System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>LIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Architecture */}
        <aside className="w-80 border-r border-border bg-card/30 flex-shrink-0 overflow-y-auto">
          <ArchitectureFlow />
        </aside>

        {/* Right Panel — Dashboard */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Location Input */}
          <LocationInput onLocationSubmit={setLocation} currentLocation={location} />

          {/* Risk Map */}
          <RiskMap location={location} />

          {/* Analytics + Alerts Row */}
          <div className="grid grid-cols-2 gap-3">
            <AnalyticsCharts />
            <AlertCenter />
          </div>

          {/* Forecast + Infrastructure Row */}
          <div className="grid grid-cols-2 gap-3">
            <ForecastPanel />
            <InfrastructureStatus />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
