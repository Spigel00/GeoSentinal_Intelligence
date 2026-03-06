import { useState } from "react";
import { useAlerts, useHighRiskAlerts } from "@/hooks/useAlerts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, RefreshCw, Download, Bell, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import type { Alert as AlertType } from "@/services/api";

export default function AlertsPage() {
  const { data: alerts, isLoading, error, refetch } = useAlerts();
  const { data: highRiskAlerts } = useHighRiskAlerts();

  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);

  // Filter alerts
  const filteredAlerts = alerts?.filter((alert) => {
    const matchesSearch = alert.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || alert.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Sort by timestamp (newest first)
  const sortedAlerts = filteredAlerts?.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Export to CSV
  const exportToCSV = () => {
    if (!sortedAlerts) return;

    const csv = [
      ["Region", "Risk Level", "Probability", "Timestamp"],
      ...sortedAlerts.map((alert) => [
        alert.region,
        alert.risk_level,
        (alert.probability * 100).toFixed(2) + "%",
        alert.timestamp,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alerts-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-risk-high text-white";
      case "MEDIUM":
        return "bg-[#F59E0B] text-white";
      case "LOW":
        return "bg-risk-low text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-wider flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Alert Management
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">
            Monitor and manage landslide risk alerts across all regions
          </p>
        </div>

        <Button variant="outline" onClick={exportToCSV} className="gap-2 font-mono">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="font-mono text-xs">Total Alerts</CardDescription>
            <CardTitle className="text-2xl font-mono">{alerts?.length || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-risk- high">
          <CardHeader className="pb-3">
            <CardDescription className="font-mono text-xs text-risk-high">HIGH Risk</CardDescription>
            <CardTitle className="text-2xl font-mono text-risk-high">
              {highRiskAlerts?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="font-mono text-xs">MEDIUM Risk</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {alerts?.filter((a) => a.risk_level === "MEDIUM").length || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="font-mono text-xs">Filtered Results</CardDescription>
            <CardTitle className="text-2xl font-mono">{sortedAlerts?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-base">Alert History</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-mono text-xs"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono"
              />
            </div>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[200px] font-mono">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">
                  All Risk Levels
                </SelectItem>
                <SelectItem value="HIGH" className="font-mono">
                  HIGH Risk
                </SelectItem>
                <SelectItem value="MEDIUM" className="font-mono">
                  MEDIUM Risk
                </SelectItem>
                <SelectItem value="LOW" className="font-mono">
                  LOW Risk
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-full h-12" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                Failed to load alerts. Please check if the backend server is running at http://localhost:8000.
              </AlertDescription>
            </Alert>
          ) : sortedAlerts && sortedAlerts.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Region</TableHead>
                    <TableHead className="font-mono">Risk Level</TableHead>
                    <TableHead className="font-mono">Probability</TableHead>
                    <TableHead className="font-mono">Timestamp</TableHead>
                    <TableHead className="font-mono text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAlerts.map((alert, index) => (
                    <TableRow key={`${alert.region}-${alert.timestamp}-${index}`} className="cursor-pointer hover:bg-secondary/50">
                      <TableCell className="font-mono font-semibold">{alert.region}</TableCell>
                      <TableCell>
                        <Badge className={`${getRiskColor(alert.risk_level)} font-mono font-bold`}>
                          {alert.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          {(alert.probability * 100).toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {format(new Date(alert.timestamp), "PPp")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono text-xs"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">
              No alerts found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-mono">Alert Details</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Complete information about the alert
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Region</p>
                  <p className="font-mono font-bold">{selectedAlert.region}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Risk Level</p>
                  <Badge className={`${getRiskColor(selectedAlert.risk_level)} font-mono font-bold mt-1`}>
                    {selectedAlert.risk_level}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Probability</p>
                  <p className="font-mono font-bold text-lg">
                    {(selectedAlert.probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Timestamp</p>
                  <p className="font-mono text-sm">{format(new Date(selectedAlert.timestamp), "PPp")}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-mono text-muted-foreground mb-2">Full Timestamp</p>
                <p className="font-mono text-sm">{format(new Date(selectedAlert.timestamp), "PPPppp")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
