import { useState } from "react";
import { MapPin, Search, Crosshair } from "lucide-react";

interface LocationInputProps {
  onLocationSubmit: (location: string) => void;
  currentLocation: string;
}

export const LocationInput = ({ onLocationSubmit, currentLocation }: LocationInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onLocationSubmit(input.trim());
      setInput("");
    }
  };

  const presets = [
    "Munnar, Kerala",
    "Kodagu, Karnataka",
    "Darjeeling, WB",
    "Shimla, HP",
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Crosshair className="w-3.5 h-3.5 text-primary" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">Target Location</span>
      </div>

      {currentLocation && (
        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded bg-primary/10 border border-primary/20">
          <MapPin className="w-3 h-3 text-primary" />
          <span className="font-mono text-xs text-primary">{currentLocation}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-1.5 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter location..."
          className="flex-1 bg-secondary border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded px-2 py-1 transition-colors"
        >
          <Search className="w-3 h-3" />
        </button>
      </form>

      <div className="flex flex-wrap gap-1">
        {presets.map((loc) => (
          <button
            key={loc}
            onClick={() => onLocationSubmit(loc)}
            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border transition-colors"
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
};
