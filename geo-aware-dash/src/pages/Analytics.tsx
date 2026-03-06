import { useQuery } from "@tanstack/react-query";
import { getStatistics } from "@/services/api";
import { useAlerts } from "@/hooks/useAlerts";
import { useRegions } from "@/hooks/useRegions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, PieChart, TrendingUp, Users, MapPin, AlertTriangle } from "lucide-react";
import { BarChart, Bar, PieChart as RechartPieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#10B981",
};

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: getStatistics,
    staleTime: 5 * 60 * 1000,
  });

  const { data: alerts } = useAlerts();
  const { data: regions } = useRegions();

  // Risk distribution data for pie chart
  const riskDistributionData = stats
    ? [
        { name: "HIGH", value: stats.riskDistribution.high, color: COLORS.HIGH },
        { name: "MEDIUM", value: stats.riskDistribution.medium, color: COLORS.MEDIUM },
        { name: "LOW", value: stats.riskDistribution.low, color: COLORS.LOW },
      ]
    : [];

  // Region risk data for bar chart
  const regionRiskData = regions?.map((region) => ({
    name: region.region,
    riskLevel: region.risk_level,
    fill:
      (region.risk_level === "HIGH" && COLORS.HIGH) ||
      (region.risk_level === "MEDIUM" && COLORS.MEDIUM) ||
      COLORS.LOW,
  }));

  // Alert timeline data (group by date)
  const alertTimelineData = alerts
    ?.reduce((acc: any[], alert) => {
      const date = new Date(alert.timestamp).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.count++;
        if (alert.risk_level === "HIGH") existing.high++;
        else if (alert.risk_level === "MEDIUM") existing.medium++;
        else existing.low++;
      } else {
        acc.push({
          date,
          count: 1,
          high: alert.risk_level === "HIGH" ? 1 : 0,
          medium: alert.risk_level === "MEDIUM" ? 1 : 0,
          low: alert.risk_level === "LOW" ? 1 : 0,
        });
      }
      return acc;
    }, [])
    .slice(-7); // Last 7 days

  if (statsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-wider flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Analytics & Statistics
        </h1>
        <p className="text-sm font-mono text-muted-foreground mt-1">
          Comprehensive insights into landslide risk patterns and trends
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="font-mono text-xs">Total Regions</CardDescription>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl font-mono">{stats?.totalRegions || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="font-mono text-xs text-primary">Active Regions</CardDescription>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-3xl font-mono text-primary">{stats?.activeRegions || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-risk-high">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="font-mono text-xs text-risk-high">HIGH Risk Alerts</CardDescription>
              <AlertTriangle className="w-4 h-4 text-risk-high" />
            </div>
            <CardTitle className="text-3xl font-mono text-risk-high">{stats?.highRiskAlerts || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="font-mono text-xs">Registered Users</CardDescription>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl font-mono">{stats?.totalUsers || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Risk Distribution
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Regions grouped by risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {riskDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartPieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground font-mono text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regional Risk Levels Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Regional Risk Levels
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Risk levels by region
            </CardDescription>
          </CardHeader>
          <CardContent>
            {regionRiskData && regionRiskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionRiskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "monospace" }} />
                  <YAxis hide />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border rounded p-2 font-mono text-xs">
                            <p className="font-bold">{payload[0].payload.name}</p>
                            <p>Risk: {payload[0].payload.riskLevel}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="riskLevel" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground font-mono text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Timeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Alert Timeline (Last 7 Days)
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Daily alert distribution by risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alertTimelineData && alertTimelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={alertTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                  <YAxis tick={{ fontSize: 12, fontFamily: "monospace" }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="high" stroke={COLORS.HIGH} strokeWidth={2} name="HIGH" />
                  <Line type="monotone" dataKey="medium" stroke={COLORS.MEDIUM} strokeWidth={2} name="MEDIUM" />
                  <Line type="monotone" dataKey="low" stroke={COLORS.LOW} strokeWidth={2} name="LOW" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground font-mono text-sm">
                No alert data available for the last 7 days
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-base">Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">Total Alerts Generated</p>
              <p className="text-2xl font-mono font-bold">{stats?.totalAlerts || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">High-Risk Alert Percentage</p>
              <p className="text-2xl font-mono font-bold text-risk-high">
                {stats?.totalAlerts
                  ? ((stats.highRiskAlerts / stats.totalAlerts) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">Average Monitoring</p>
              <p className="text-2xl font-mono font-bold text-primary">24/7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
