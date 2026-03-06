import { useQuery } from "@tanstack/react-query";
import { getStatistics } from "@/services/api";
import { useHighRiskAlerts } from "@/hooks/useAlerts";
import { useMapRiskLevels } from "@/hooks/useRegions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: getStatistics,
    staleTime: 5 * 60 * 1000,
  });

  const { data: highRiskAlerts, isLoading: alertsLoading } = useHighRiskAlerts();
  const { data: regions, isLoading: regionsLoading } = useMapRiskLevels();

  const recentHighRiskAlerts = highRiskAlerts?.slice(0, 5);

  if (statsLoading || alertsLoading || regionsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-wider flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">
            Welcome to GeoSentinel Landslide Early Warning System
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-muted-foreground text-right">
            <p>Last Updated</p>
            <p className="text-primary font-bold">{format(new Date(), "PPp")}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="font-mono text-xs text-primary">
                Active Regions
              </CardDescription>
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-4xl font-mono text-primary">
              {stats?.activeRegions || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-mono text-muted-foreground">
              Out of {stats?.totalRegions || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-risk-high">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="font-mono text-xs text-risk-high">
                HIGH Risk Alerts
              </CardDescription>
              <AlertTriangle className="w-5 h-5 text-risk-high" />
            </div>
            <CardTitle className="text-4xl font-mono text-risk-high">
              {stats?.highRiskAlerts || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-mono text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="font-mono text-xs">Total Alerts</CardDescription>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-4xl font-mono">{stats?.totalAlerts || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-mono text-muted-foreground">All time cumulative</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="font-mono text-xs">Registered Users</CardDescription>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-4xl font-mono">{stats?.totalUsers || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-mono text-muted-foreground">Receiving notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent HIGH-Risk Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-mono text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-risk-high" />
                Recent HIGH-Risk Alerts
              </CardTitle>
              <Link to="/alerts">
                <Button variant="ghost" size="sm" className="gap-2 font-mono text-xs">
                  View All
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentHighRiskAlerts && recentHighRiskAlerts.length > 0 ? (
              <div className="space-y-3">
                {recentHighRiskAlerts.map((alert, index) => (
                  <div
                    key={`${alert.region}-${alert.timestamp}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-risk-high text-white font-mono font-bold">HIGH</Badge>
                      <div>
                        <p className="font-mono font-semibold">{alert.region}</p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {format(new Date(alert.timestamp), "PPp")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">
                        {(alert.probability * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">Probability</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                No high-risk alerts at the moment
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/predictions">
              <Button className="w-full justify-start gap-2 font-mono">
                <Activity className="w-4 h-4" />
                Make Prediction
              </Button>
            </Link>

            <Link to="/users">
              <Button variant="outline" className="w-full justify-start gap-2 font-mono">
                <Users className="w-4 h-4" />
                Manage Users
              </Button>
            </Link>

            <Link to="/map">
              <Button variant="outline" className="w-full justify-start gap-2 font-mono">
                <MapPin className="w-4 h-4" />
                View Map
              </Button>
            </Link>

            <Link to="/analytics">
              <Button variant="outline" className="w-full justify-start gap-2 font-mono">
                <TrendingUp className="w-4 h-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-base">Regional Risk Overview</CardTitle>
          <CardDescription className="font-mono text-xs">
            Current risk levels across all monitored regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {regions && regions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regions.map((region) => {
                const riskColor =
                  region.risk_level === "HIGH"
                    ? "border-risk-high"
                    : region.risk_level === "MEDIUM"
                    ? "border-[#F59E0B]"
                    : "border-risk-low";

                return (
                  <div
                    key={region.region}
                    className={`border-2 ${riskColor} rounded-lg p-4 space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono font-bold">{region.region}</h4>
                      <Badge
                        className={`font-mono font-bold ${
                          region.risk_level === "HIGH"
                            ? "bg-risk-high text-white"
                            : region.risk_level === "MEDIUM"
                            ? "bg-[#F59E0B] text-white"
                            : "bg-risk-low text-white"
                        }`}
                      >
                        {region.risk_level}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span className="text-[10px]">
                          {region.lat.toFixed(2)}, {region.lon.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground font-mono text-sm">
              No region data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
