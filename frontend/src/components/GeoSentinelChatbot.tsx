import { useState } from "react";
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
      content: "Welcome to GeoSentinel Intelligence Assistant. Select your role, region, and risk level to receive tailored landslide risk intelligence.",
      timestamp: new Date()
    }
  ]);
  
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [selectedRegion, setSelectedRegion] = useState<string>("Ladakh");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("MEDIUM");
  const [probability, setProbability] = useState<number>(0.65);
  const [isLoading, setIsLoading] = useState(false);

  const currentRole = ROLES.find(r => r.id === selectedRole);

  const handleGenerateIntelligence = async () => {
    if (!selectedRole || !selectedRegion || !selectedRiskLevel) {
      return;
    }

    setIsLoading(true);

    try {
      // Add user query message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: `Generate ${currentRole?.name} intelligence for ${selectedRegion} region with ${selectedRiskLevel} risk level (${Math.round(probability * 100)}% probability)`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Call AI API
      const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
        role: selectedRole,
        region: selectedRegion,
        risk_level: selectedRiskLevel,
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
          risk_level: selectedRiskLevel
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

          {/* Risk Level Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Risk Level</label>
            <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                {RISK_LEVELS.map(risk => (
                  <SelectItem key={risk.value} value={risk.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", risk.color)} />
                      <span className="text-xs">{risk.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Probability Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              Probability ({Math.round(probability * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={probability}
              onChange={(e) => setProbability(parseFloat(e.target.value))}
              className="w-full h-9 cursor-pointer"
            />
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
          disabled={isLoading || !selectedRole || !selectedRegion || !selectedRiskLevel}
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Generating...
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
