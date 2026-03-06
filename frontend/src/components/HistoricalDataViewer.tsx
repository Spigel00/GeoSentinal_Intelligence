import { History, TrendingDown, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HistoricalIncident {
  date: string;
  zone: string;
  severity: "low" | "medium" | "high";
  casualties: number;
  damage: string;
}

export const HistoricalDataViewer = () => {
  const incidents: HistoricalIncident[] = [
    { date: "2025-08-15", zone: "Zone A", severity: "high", casualties: 0, damage: "Road blocked" },
    { date: "2025-06-22", zone: "Zone D", severity: "medium", casualties: 0, damage: "Minor debris" },
    { date: "2024-09-10", zone: "Zone G", severity: "high", casualties: 3, damage: "Houses damaged" },
    { date: "2024-07-28", zone: "Zone B", severity: "low", casualties: 0, damage: "None" },
    { date: "2023-12-03", zone: "Zone A", severity: "high", casualties: 12, damage: "Major damage" },
  ];

  const yearlyStats = [
    { year: "2023", incidents: 8, casualties: 23, prediction: 85 },
    { year: "2024", incidents: 12, casualties: 15, prediction: 88 },
    { year: "2025", incidents: 5, casualties: 0, prediction: 94 },
    { year: "2026", incidents: 2, casualties: 0, prediction: 96 },
  ];

  const severityColors = {
    high: "text-risk-high",
    medium: "text-risk-medium",
    low: "text-risk-low",
  };

  const severityBg = {
    high: "bg-risk-high/20",
    medium: "bg-risk-medium/20",
    low: "bg-risk-low/20",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-3.5 h-3.5 text-accent" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
          Historical Analysis
        </span>
      </div>

      <Tabs defaultValue="incidents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-7">
          <TabsTrigger value="incidents" className="text-[9px] font-mono">Incidents</TabsTrigger>
          <TabsTrigger value="trends" className="text-[9px] font-mono">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="mt-2">
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {incidents.map((incident, idx) => (
              <div
                key={idx}
                className={`${severityBg[incident.severity]} rounded px-2 py-1.5 border border-border/50`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-3 h-3 ${severityColors[incident.severity]}`} />
                      <span className="text-[9px] font-mono font-semibold text-foreground">{incident.zone}</span>
                      <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${severityBg[incident.severity]} ${severityColors[incident.severity]}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-5">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[8px] font-mono text-muted-foreground">{incident.date}</span>
                      </div>
                      <span className="text-[8px] font-mono text-muted-foreground">
                        Casualties: <span className={incident.casualties > 0 ? "text-risk-high font-bold" : "text-risk-low"}>{incident.casualties}</span>
                      </span>
                    </div>
                    <div className="text-[8px] font-mono text-muted-foreground mt-0.5 ml-5">
                      Damage: {incident.damage}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-2 bg-secondary/30 rounded border border-border/50">
            <div className="text-[9px] font-mono text-muted-foreground mb-1">System Performance:</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-sm font-mono font-bold text-primary">94%</div>
                <div className="text-[7px] font-mono text-muted-foreground">Predicted</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-mono font-bold text-risk-low">88%</div>
                <div className="text-[7px] font-mono text-muted-foreground">Prevented</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-mono font-bold text-accent">2.3h</div>
                <div className="text-[7px] font-mono text-muted-foreground">Avg Warning</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-2">
          <div className="space-y-2">
            {yearlyStats.map((stat, idx) => {
              const prevStat = yearlyStats[idx - 1];
              const incidentTrend = prevStat ? stat.incidents - prevStat.incidents : 0;
              const casualtyTrend = prevStat ? stat.casualties - prevStat.casualties : 0;
              
              return (
                <div key={stat.year} className="bg-secondary/30 rounded px-3 py-2 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-primary">{stat.year}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-mono text-muted-foreground">Model Accuracy:</span>
                      <span className="text-[9px] font-mono font-bold text-accent">{stat.prediction}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-muted-foreground">Incidents:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono font-bold text-foreground">{stat.incidents}</span>
                          {prevStat && (
                            incidentTrend > 0 ? (
                              <TrendingUp className="w-3 h-3 text-risk-high" />
                            ) : incidentTrend < 0 ? (
                              <TrendingDown className="w-3 h-3 text-risk-low" />
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-muted-foreground">Casualties:</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] font-mono font-bold ${stat.casualties === 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                            {stat.casualties}
                          </span>
                          {prevStat && (
                            casualtyTrend > 0 ? (
                              <TrendingUp className="w-3 h-3 text-risk-high" />
                            ) : casualtyTrend < 0 ? (
                              <TrendingDown className="w-3 h-3 text-risk-low" />
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/30">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-mono text-primary font-semibold">
                76% reduction in casualties since system deployment
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
