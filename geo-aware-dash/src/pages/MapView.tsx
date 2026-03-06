import { InteractiveMap } from "@/components/InteractiveMap";
import { useMapRiskLevels } from "@/hooks/useRegions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, RefreshCw, MapPin } from "lucide-react";

export default function MapViewPage() {
  const { data: regions, refetch, isLoading } = useMapRiskLevels();

  const highRiskCount = regions?.filter((r) => r.risk_level === "HIGH").length || 0;
  const mediumRiskCount = regions?.filter((r) => r.risk_level === "MEDIUM").length || 0;
  const lowRiskCount = regions?.filter((r) => r.risk_level === "LOW").length || 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold tracking-wider flex items-center gap-3">
                <Map className="w-8 h-8 text-primary" />
                Interactive Risk Map
              </h1>
              <p className="text-sm font-mono text-muted-foreground mt-1">
                Real-time landslide risk visualization across monitored regions
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-2 font-mono"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-mono text-xs">Total Regions</CardDescription>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-mono">{regions?.length || 0}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-risk-high">
              <CardHeader className="pb-3">
                <CardDescription className="font-mono text-xs text-risk-high">
                  HIGH Risk
                </CardDescription>
                <CardTitle className="text-2xl font-mono text-risk-high">{highRiskCount}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="font-mono text-xs">MEDIUM Risk</CardDescription>
                <CardTitle className="text-2xl font-mono">{mediumRiskCount}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="font-mono text-xs text-risk-low">
                  LOW Risk
                </CardDescription>
                <CardTitle className="text-2xl font-mono text-risk-low">{lowRiskCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 container mx-auto p-6">
        <InteractiveMap height="calc(100vh - 350px)" showControls={true} />
      </div>
    </div>
  );
}
