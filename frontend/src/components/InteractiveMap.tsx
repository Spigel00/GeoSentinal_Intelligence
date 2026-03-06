import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import { useMapRiskLevels } from '@/hooks/useRegions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, MapPin, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

// Fix for default marker icons in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Risk level colors
const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'HIGH':
      return '#EF4444';
    case 'MEDIUM':
      return '#F59E0B';
    case 'LOW':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

// Risk level icons
const getRiskIcon = (riskLevel: string) => {
  const color = getRiskColor(riskLevel);
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

interface InteractiveMapProps {
  height?: string;
  showControls?: boolean;
}

export function InteractiveMap({ height = '600px', showControls = true }: InteractiveMapProps) {
  const { data: regions, isLoading, error, refetch } = useMapRiskLevels();

  // Calculate center position (average of all regions or default to India)
  const center: LatLngExpression = regions && regions.length > 0
    ? [
        regions.reduce((sum, r) => sum + r.lat, 0) / regions.length,
        regions.reduce((sum, r) => sum + r.lon, 0) / regions.length,
      ]
    : [20.5937, 78.9629]; // Center of India

  if (isLoading) {
    return (
      <div className="w-full" style={{ height }}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load map data. Please check if the backend server is running at http://localhost:8000.
          <button
            onClick={() => refetch()}
            className="ml-2 underline font-semibold"
          >
            Retry
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full relative" style={{ height }}>
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000]">
          <Card className="p-3 bg-card/95 backdrop-blur-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-3 h-3 rounded-full bg-risk-high"></div>
                <span>HIGH Risk</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <span>MEDIUM Risk</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-3 h-3 rounded-full bg-risk-low"></div>
                <span>LOW Risk</span>
              </div>
              <div className="pt-2 border-t text-xs font-mono text-muted-foreground">
                {regions?.length || 0} Regions
              </div>
            </div>
          </Card>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={6}
        className="w-full h-full rounded-lg border"
        scrollWheelZoom={true}
      >
        {/* Google-style satellite imagery with terrain */}
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={20}
        />

        {regions && regions.map((region, index) => {
          const position: LatLngExpression = [region.lat, region.lon];
          const riskLevel = region.risk_level || 'LOW';
          const color = getRiskColor(riskLevel);

          return (
            <div key={index}>
              {/* Marker */}
              <Marker
                position={position}
                icon={getRiskIcon(riskLevel)}
              >
                {/* Permanent label showing region name */}
                <Tooltip permanent direction="top" offset={[0, -10]} className="font-mono font-bold text-xs">
                  {region.region}
                </Tooltip>
                
                <Popup className="font-mono">
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {region.region}
                      </h3>
                      <Badge
                        className={`font-mono font-bold ${
                          riskLevel === 'HIGH'
                            ? 'bg-risk-high'
                            : riskLevel === 'MEDIUM'
                            ? 'bg-[#F59E0B]'
                            : 'bg-risk-low'
                        }`}
                      >
                        {riskLevel}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span className="font-mono text-[10px]">
                          {region.lat.toFixed(4)}, {region.lon.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Risk Circle - Smaller and more transparent for better performance */}
              <Circle
                center={position}
                radius={3000} // 3 km radius
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.08,
                  weight: 1,
                }}
              />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
