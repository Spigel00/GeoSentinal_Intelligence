import { useState } from "react";
import { Shield, Clock, Settings } from "lucide-react";
import { ArchitectureFlow } from "@/components/ArchitectureFlow";
import { LocationInput } from "@/components/LocationInput";
import { RiskMap } from "@/components/RiskMap";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { AlertCenter } from "@/components/AlertCenter";
import { ForecastPanel } from "@/components/ForecastPanel";
import { InfrastructureStatus } from "@/components/InfrastructureStatus";
import { EmergencyPanel } from "@/components/EmergencyPanel";
import { HistoricalDataViewer } from "@/components/HistoricalDataViewer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [location, setLocation] = useState("Munnar, Kerala");
  const [activeView, setActiveView] = useState<"overview" | "emergency" | "history">("overview");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between sticky top-0 z-50">
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
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex gap-1">
            {[
              { key: "overview", label: "Overview" },
              { key: "emergency", label: "Emergency" },
              { key: "history", label: "History" },
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key as any)}
                className={`text-[9px] font-mono px-2 py-1 rounded transition-colors ${
                  activeView === view.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>LIVE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
            </div>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Settings className="h-3.5 w-3.5" />
            </Button>
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

          {/* Overview View */}
          {activeView === "overview" && (
            <>
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
            </>
          )}

          {/* Emergency View */}
          {activeView === "emergency" && (
            <>
              {/* Risk Map */}
              <RiskMap location={location} />
              
              <div className="grid grid-cols-2 gap-3">
                {/* Emergency Panel */}
                <EmergencyPanel />
                
                {/* Alert Center */}
                <AlertCenter />
              </div>

              {/* Forecast + Infrastructure Row */}
              <div className="grid grid-cols-2 gap-3">
                <ForecastPanel />
                <InfrastructureStatus />
              </div>
            </>
          )}

          {/* History View */}
          {activeView === "history" && (
            <>
              {/* Historical Data */}
              <HistoricalDataViewer />

              {/* Analytics + Risk Map Row */}
              <div className="grid grid-cols-2 gap-3">
                <AnalyticsCharts />
                <RiskMap location={location} />
              </div>

              {/* Infrastructure Status - Full Width */}
              <InfrastructureStatus />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
