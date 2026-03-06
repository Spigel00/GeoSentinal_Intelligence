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
      {/* Compact Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-mono font-bold tracking-wider flex items-center gap-2">
                <Map className="w-6 h-6 text-primary" />
                Risk Map
              </h1>
              
              {/* Inline Stats */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="font-mono text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {regions?.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-risk-high font-mono text-xs">
                    {highRiskCount} HIGH
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-[#F59E0B] font-mono text-xs">
                    {mediumRiskCount} MED
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-risk-low font-mono text-xs">
                    {lowRiskCount} LOW
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-2 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Map - Full Height */}
      <div className="flex-1 container mx-auto p-4">
        <InteractiveMap height="calc(100vh - 120px)" showControls={true} />
      </div>
    </div>
  );
}
