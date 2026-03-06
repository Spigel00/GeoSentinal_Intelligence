import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (email && password) {
        // Store auth token (in a real app, this would come from the server)
        localStorage.setItem("geosentinel_auth", "authenticated");
        localStorage.setItem("geosentinel_user", JSON.stringify({ 
          email, 
          name: email.split("@")[0],
          role: "Administrator"
        }));
        navigate("/");
      } else {
        setError("Please enter both email and password");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 scanline opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="w-16 h-16 text-primary" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-mono font-bold tracking-wider">
              GEO<span className="text-primary">SENTINEL</span>
            </CardTitle>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
              Landslide Early Warning System
            </p>
          </div>
          <CardDescription className="text-xs">
            Sign in to access the monitoring dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* Demo credentials hint */}
            <Alert className="py-2 bg-primary/10 border-primary/30">
              <Shield className="h-4 w-4 text-primary -mt-0.5" />
              <AlertDescription className="text-xs text-primary">
                <strong>Demo:</strong> Enter any email and password to access the system
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-mono">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@geosentinel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-mono">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 font-mono text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-border" />
                <span className="font-mono text-muted-foreground">Remember me</span>
              </label>
              <button
                type="button"
                className="font-mono text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full font-mono font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs">
            <span className="font-mono text-muted-foreground">Don't have an account? </span>
            <a href="/register" className="font-mono text-primary hover:text-primary/80 transition-colors font-semibold">
              Register here
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-secondary/50 rounded p-2">
                <div className="text-xs font-mono font-bold text-primary">99.8%</div>
                <div className="text-[9px] font-mono text-muted-foreground">Uptime</div>
              </div>
              <div className="bg-secondary/50 rounded p-2">
                <div className="text-xs font-mono font-bold text-accent">94.2%</div>
                <div className="text-[9px] font-mono text-muted-foreground">Accuracy</div>
              </div>
              <div className="bg-secondary/50 rounded p-2">
                <div className="text-xs font-mono font-bold text-risk-low">24/7</div>
                <div className="text-[9px] font-mono text-muted-foreground">Active</div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] font-mono text-muted-foreground">
            Protected by advanced security protocols
          </p>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[9px] font-mono text-muted-foreground">
          © 2026 GeoSentinel. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
