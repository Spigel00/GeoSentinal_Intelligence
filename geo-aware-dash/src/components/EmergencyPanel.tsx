import { Phone, AlertCircle, Shield, MapPin, Users, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available: boolean;
}

interface EvacuationRoute {
  id: string;
  name: string;
  status: "clear" | "congested" | "blocked";
  distance: string;
  capacity: string;
}

export const EmergencyPanel = () => {
  const contacts: EmergencyContact[] = [
    { name: "District Emergency Control", role: "Primary", phone: "1800-425-1234", available: true },
    { name: "Local Fire Department", role: "Rescue", phone: "101", available: true },
    { name: "Medical Emergency", role: "Ambulance", phone: "108", available: true },
    { name: "Disaster Management Cell", role: "Coordinator", phone: "+91-471-2345678", available: false },
  ];

  const routes: EvacuationRoute[] = [
    { id: "1", name: "Route A - Main Highway", status: "clear", distance: "2.3km", capacity: "85%" },
    { id: "2", name: "Route B - Hill Road", status: "congested", distance: "3.1km", capacity: "92%" },
    { id: "3", name: "Route C - Valley Path", status: "blocked", distance: "1.8km", capacity: "N/A" },
  ];

  const statusStyles = {
    clear: { bg: "bg-risk-low/20", text: "text-risk-low", label: "CLEAR" },
    congested: { bg: "bg-risk-medium/20", text: "text-risk-medium", label: "CONGESTED" },
    blocked: { bg: "bg-risk-high/20", text: "text-risk-high", label: "BLOCKED" },
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-risk-high" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-risk-high">
            Emergency Response
          </span>
        </div>
        <Button 
          size="sm" 
          variant="destructive" 
          className="h-6 text-[9px] font-mono font-bold px-2"
        >
          ACTIVATE PROTOCOL
        </Button>
      </div>

      {/* Emergency Contacts */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Phone className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
            Emergency Contacts
          </span>
        </div>
        <div className="space-y-1">
          {contacts.map((contact, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between bg-secondary/30 rounded px-2 py-1.5 border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-semibold text-foreground">{contact.name}</span>
                  {contact.available ? (
                    <span className="flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-risk-low" />
                      <span className="text-[7px] font-mono text-risk-low">AVAILABLE</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-risk-medium" />
                      <span className="text-[7px] font-mono text-risk-medium">BUSY</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] font-mono text-muted-foreground">{contact.role}</span>
                  <span className="text-[8px] font-mono text-primary font-semibold">{contact.phone}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-5 w-5 p-0"
                disabled={!contact.available}
              >
                <Phone className="h-2.5 w-2.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Evacuation Routes */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Navigation className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
            Evacuation Routes
          </span>
        </div>
        <div className="space-y-1">
          {routes.map((route) => {
            const style = statusStyles[route.status];
            return (
              <div 
                key={route.id} 
                className={`${style.bg} rounded px-2 py-1.5 border border-border/50`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3 h-3 ${style.text}`} />
                      <span className="text-[9px] font-mono font-semibold text-foreground">{route.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 ml-5">
                      <span className="text-[8px] font-mono text-muted-foreground">
                        Distance: <span className="text-foreground">{route.distance}</span>
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground">
                        Capacity: <span className="text-foreground">{route.capacity}</span>
                      </span>
                    </div>
                  </div>
                  <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Zones */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
            Safe Zones
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Community Hall A", capacity: "500", current: "142" },
            { name: "School Ground B", capacity: "800", current: "0" },
            { name: "Stadium C", capacity: "2000", current: "85" },
            { name: "Temple Complex D", capacity: "300", current: "0" },
          ].map((zone, idx) => (
            <div key={idx} className="bg-secondary/30 rounded px-2 py-1.5 border border-border/50">
              <div className="text-[9px] font-mono font-semibold text-foreground">{zone.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[7px] font-mono text-muted-foreground">Cap: {zone.capacity}</span>
                <span className="text-[7px] font-mono text-primary font-bold">
                  {zone.current}/{zone.capacity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
