import { useState } from "react";
import { useMakePrediction } from "@/hooks/usePredictions";
import { useRegions, useRegionPrediction } from "@/hooks/useRegions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Activity, CloudRain, Droplets, Mountain, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import type { PredictionInput } from "@/services/api";

export default function PredictionsPage() {
  const makePrediction = useMakePrediction();
  const regionPrediction = useRegionPrediction();
  const { data: regions } = useRegions();

  const [formData, setFormData] = useState<PredictionInput>({
    rainfall_6h: 50,
    rainfall_12h: 80,
    rainfall_24h: 120,
    soil_saturation_index: 0.5,
    slope_stability_factor: 0.7,
    terrain_vulnerability_index: 0.4,
  });

  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const handleSliderChange = (field: keyof PredictionInput, value: number[]) => {
    setFormData((prev) => ({ ...prev, [field]: value[0] }));
  };

  const handleInputChange = (field: keyof PredictionInput, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({  ...prev, [field]: numValue }));
    }
  };

  const handleCustomPrediction = async () => {
    const result = await makePrediction.mutateAsync(formData);
    setPredictionResult(result);
  };

  const handleRegionPrediction = async () => {
    if (selectedRegion) {
      const result = await regionPrediction.mutateAsync(selectedRegion);
      setPredictionResult(result);
    }
  };

  const resetForm = () => {
    setFormData({
      rainfall_6h: 50,
      rainfall_12h: 80,
      rainfall_24h: 120,
      soil_saturation_index: 0.5,
      slope_stability_factor: 0.7,
      terrain_vulnerability_index: 0.4,
    });
    setPredictionResult(null);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-risk-high";
      case "MEDIUM":
        return "bg-[#F59E0B]";
      case "LOW":
        return "bg-risk-low";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-wider flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          Landslide Risk Prediction
        </h1>
        <p className="text-sm font-mono text-muted-foreground mt-1">
          Analyze environmental parameters to predict landslide risk levels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Prediction Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-mono text-lg">Custom Prediction</CardTitle>
            <CardDescription className="font-mono text-xs">
              Adjust environmental parameters to calculate landslide risk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rainfall Parameters */}
            <div className="space-y-4">
              <h3 className="font-mono font-semibold text-sm flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-primary" />
                Rainfall Data (mm)
              </h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs">6-Hour Rainfall</Label>
                    <Input
                      type="number"
                      value={formData.rainfall_6h}
                      onChange={(e) => handleInputChange("rainfall_6h", e.target.value)}
                      className="w-20 h-8 font-mono text-xs text-right"
                      min={0}
                      max={200}
                    />
                  </div>
                  <Slider
                    value={[formData.rainfall_6h]}
                    onValueChange={(val) => handleSliderChange("rainfall_6h", val)}
                    min={0}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs">12-Hour Rainfall</Label>
                    <Input
                      type="number"
                      value={formData.rainfall_12h}
                      onChange={(e) => handleInputChange("rainfall_12h", e.target.value)}
                      className="w-20 h-8 font-mono text-xs text-right"
                      min={0}
                      max={300}
                    />
                  </div>
                  <Slider
                    value={[formData.rainfall_12h]}
                    onValueChange={(val) => handleSliderChange("rainfall_12h", val)}
                    min={0}
                    max={300}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs">24-Hour Rainfall</Label>
                    <Input
                      type="number"
                      value={formData.rainfall_24h}
                      onChange={(e) => handleInputChange("rainfall_24h", e.target.value)}
                      className="w-20 h-8 font-mono text-xs text-right"
                      min={0}
                      max={400}
                    />
                  </div>
                  <Slider
                    value={[formData.rainfall_24h]}
                    onValueChange={(val) => handleSliderChange("rainfall_24h", val)}
                    min={0}
                    max={400}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Terrain Parameters */}
            <div className="space-y-4">
              <h3 className="font-mono font-semibold text-sm flex items-center gap-2">
                <Mountain className="w-4 h-4 text-primary" />
                Terrain Conditions (0-1 scale)
              </h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs flex items-center gap-2">
                      <Droplets className="w-3 h-3" />
                      Soil Saturation
                    </Label>
                    <Input
                      type="number"
                      value={formData.soil_saturation_index}
                      onChange={(e) => handleInputChange("soil_saturation_index", e.target.value)}
                      className="w-20 h-8 font-mono text-xs text-right"
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </div>
                  <Slider
                    value={[formData.soil_saturation_index]}
                    onValueChange={(val) => handleSliderChange("soil_saturation_index", val)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Current: {(formData.soil_saturation_index * 100).toFixed(0)}% saturated
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs flex items-center gap-2">
                      <TrendingDown className="w-3 h-3" />
                      Slope Stability
                    </Label>
                    <Input
                      type="number"
                      value={formData.slope_stability_factor}
                      onChange={(e) => handleInputChange("slope_stability_factor", e.target.value)}
                      className="w-20 h-8 font-mono text-xs text-right"
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </div>
                  <Slider
                    value={[formData.slope_stability_factor]}
                    onValueChange={(val) => handleSliderChange("slope_stability_factor", val)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Current: {(formData.slope_stability_factor * 100).toFixed(0)}% stable
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Terrain Vulnerability
                    </Label>
                    <Input
                      type="number"
                      value={formData.terrain_vulnerability_index}
                      onChange={(e) => handleInputChange("terrain_vulnerability_index", e.target.value)}
                      className="w-20 h-8 font-mono text-xs text-right"
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </div>
                  <Slider
                    value={[formData.terrain_vulnerability_index]}
                    onValueChange={(val) => handleSliderChange("terrain_vulnerability_index", val)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Current: {(formData.terrain_vulnerability_index * 100).toFixed(0)}% vulnerable
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetForm} className="flex-1 gap-2 font-mono">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                onClick={handleCustomPrediction}
                disabled={makePrediction.isPending}
                className="flex-1 gap-2 font-mono font-semibold"
              >
                {makePrediction.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Predict Risk
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results & Region Prediction */}
        <div className="space-y-6">
          {/* Prediction Result */}
          {predictionResult && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-mono text-base">Prediction Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <Badge
                    className={`${getRiskColor(predictionResult.risk_level)} text-white font-mono font-bold text-lg px-4 py-2`}
                  >
                    {predictionResult.risk_level} RISK
                  </Badge>

                  <div className="space-y-1">
                    <p className="text-xs font-mono text-muted-foreground">Landslide Probability</p>
                    <p className="text-3xl font-mono font-bold">
                      {(predictionResult.landslide_probability * 100).toFixed(1)}%
                    </p>
                    <Progress
                      value={predictionResult.landslide_probability * 100}
                      className="h-2"
                    />
                  </div>

                  {predictionResult.region && (
                    <div className="pt-3 border-t">
                      <p className="text-xs font-mono text-muted-foreground">Region</p>
                      <p className="text-lg font-mono font-bold">
                        {predictionResult.region}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Region Prediction */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-base">Region Prediction</CardTitle>
              <CardDescription className="font-mono text-xs">
                Generate prediction for a specific region
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions?.map((region) => (
                    <SelectItem key={region.region} value={region.region} className="font-mono">
                      {region.region}
                    </SelectItem>
                 ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleRegionPrediction}
                disabled={!selectedRegion || regionPrediction.isPending}
                className="w-full font-mono"
              >
                {regionPrediction.isPending ? "Processing..." : "Generate Prediction"}
              </Button>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="p-4 space-y-2">
              <h4 className="font-mono font-semibold text-xs text-primary">Risk Classification</h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-risk-low"></div>
                  <span>LOW: &lt; 40% probability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                  <span>MEDIUM: 40-70% probability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-risk-high"></div>
                  <span>HIGH: &gt; 70% probability</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
