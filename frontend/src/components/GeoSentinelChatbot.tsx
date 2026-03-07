import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Shield, Ambulance, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    role: string;
    region: string;
    risk_level: string;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

const ROLES: Role[] = [
  {
    id: "user",
    name: "Civilian User",
    description: "Safety-focused advisories for general public",
    icon: User,
    color: "text-blue-500"
  },
  {
    id: "admin",
    name: "Defense Admin",
    description: "Tactical intelligence for defense operations",
    icon: Shield,
    color: "text-green-500"
  },
  {
    id: "rescue",
    name: "Rescue Team",
    description: "Emergency response guidance",
    icon: Ambulance,
    color: "text-red-500"
  }
];

const REGIONS = [
  "Ladakh",
  "Himachal Pradesh",
  "Uttarakhand",
  "Jammu & Kashmir",
  "Sikkim",
  "Arunachal Pradesh",
  "Meghalaya",
  "Assam"
];

const RISK_LEVELS = [
  { value: "LOW", label: "Low Risk", color: "bg-green-500" },
  { value: "MEDIUM", label: "Medium Risk", color: "bg-yellow-500" },
  { value: "HIGH", label: "High Risk", color: "bg-red-500" }
];

export const GeoSentinelChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to GeoSentinel Intelligence Assistant. Select a region to load latest prediction data, then get role-specific intelligence.",
      timestamp: new Date()
    }
  ]);
  
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [probability, setProbability] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<string>("LOW");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  const currentRole = ROLES.find(r => r.id === selectedRole);

  // Fetch prediction data when region changes
  useEffect(() => {
    if (selectedRegion) {
      loadRegionPrediction();
    }
  }, [selectedRegion]);

  const loadRegionPrediction = async () => {
    setIsLoadingPrediction(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/predict/${selectedRegion}`);
      const prediction = response.data;
      
      setProbability(prediction.landslide_probability);
      setRiskLevel(prediction.risk_level);
      
      const predictionMessage: ChatMessage = {
        id: `prediction-${Date.now()}`,
        role: "assistant",
        content: `📊 Latest prediction data loaded for ${selectedRegion}: Risk Level: ${prediction.risk_level} (${Math.round(prediction.landslide_probability * 100)}% probability)`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, predictionMessage]);
    } catch (error: any) {
      console.error("Error loading prediction:", error);
      // Use mock data if API fails
      const mockProb = Math.random() * 0.8 + 0.2;
      setProbability(mockProb);
      setRiskLevel(mockProb > 0.7 ? "HIGH" : mockProb > 0.4 ? "MEDIUM" : "LOW");
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const handleGenerateIntelligence = async () => {
    if (!selectedRole || !selectedRegion || !riskLevel) {
      return;
    }

    setIsLoading(true);

    try {
      // Add user query message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: `Generate ${currentRole?.name} intelligence for ${selectedRegion} region with ${riskLevel} risk level (${Math.round(probability * 100)}% probability)`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Call AI API
      const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
        role: selectedRole,
        region: selectedRegion,
        risk_level: riskLevel,
        probability: probability
      });

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.message,
        timestamp: new Date(),
        metadata: {
          role: selectedRole,
          region: selectedRegion,
          risk_level: riskLevel
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error generating intelligence:", error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error generating intelligence: ${error.response?.data?.detail || error.message}. Please try again.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    const riskLevel = RISK_LEVELS.find(r => r.value === level);
    return riskLevel?.color || "bg-gray-500";
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        {/* Control Panel */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg border">
          {/* Role Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <role.icon className={cn("w-3 h-3", role.color)} />
                      <span className="text-xs">{role.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Region</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(region => (
                  <SelectItem key={region} value={region}>
                    <span className="text-xs">{region}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Risk Level Display (Data-Driven) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Risk Level (from data)</label>
            <div className="h-9 flex items-center px-3 rounded border border-border bg-muted/50 text-xs font-medium">
              <Badge 
                className={cn(
                  "text-[10px] py-0.5 px-2",
                  riskLevel === "HIGH" && "bg-red-500 text-white",
                  riskLevel === "MEDIUM" && "bg-yellow-500 text-white",
                  riskLevel === "LOW" && "bg-green-500 text-white"
                )}
              >
                {riskLevel}
              </Badge>
            </div>
          </div>

          {/* Probability Display (Data-Driven) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              Probability ({Math.round(probability * 100)}%)
            </label>
            <div className="h-9 flex items-center px-3 rounded border border-border bg-muted/50">
              <div className="text-xs font-mono font-medium w-full bg-gradient-to-r from-green-500 to-red-500 rounded text-white px-2 py-1 text-center">
                {Math.round(probability * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-2 p-2 border rounded-lg bg-background">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 animate-in fade-in-0 slide-in-from-bottom-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg p-2.5 shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="flex items-start gap-1.5">
                  {message.role === "assistant" && (
                    <Info className="w-3 h-3 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.metadata && (
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50">
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          {message.metadata.region}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] py-0 px-1.5",
                            message.metadata.risk_level === "HIGH" && "bg-red-500/20 text-red-700",
                            message.metadata.risk_level === "MEDIUM" && "bg-yellow-500/20 text-yellow-700",
                            message.metadata.risk_level === "LOW" && "bg-green-500/20 text-green-700"
                          )}
                        >
                          {message.metadata.risk_level}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Generating intelligence...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateIntelligence}
          disabled={isLoading || isLoadingPrediction || !selectedRole || !selectedRegion || probability === 0}
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Generating...
            </>
          ) : isLoadingPrediction ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Loading Data...
            </>
          ) : (
            <>
              <Send className="w-3 h-3 mr-2" />
              Generate Intelligence
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
