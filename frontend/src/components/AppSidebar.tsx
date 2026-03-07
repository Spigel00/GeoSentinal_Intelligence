import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Map,
  Users,
  Activity,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Terminal,
  Sun,
  Moon,
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Map View",
    href: "/map",
    icon: Map,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Predictions",
    href: "/predictions",
    icon: Activity,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: AlertCircle,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "API Console",
    href: "/api-console",
    icon: Terminal,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("geosentinel_user") || "{}");
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('online');

  // Check backend health every 10 seconds
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await axios.get('http://localhost:8000/health', { timeout: 3000 });
        setBackendStatus('online');
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    // Initial check
    checkBackendHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkBackendHealth, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("geosentinel_auth");
    localStorage.removeItem("geosentinel_user");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-10 h-10 text-primary" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </div>
          <div>
            <h2 className="text-lg font-mono font-bold tracking-wider">
              GEO<span className="text-primary">SENTINEL</span>
            </h2>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              Early Warning System
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
            <span className="text-sm font-mono font-bold text-primary">
              {user.name?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono font-medium truncate">{user.name || "User"}</p>
            <p className="text-xs font-mono text-muted-foreground truncate">
              {user.role || "Administrator"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md font-mono text-sm transition-all",
                  "hover:bg-secondary/80",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-risk-high text-white px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 font-mono text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 mb-2"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <>
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 font-mono text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>

        <div className="mt-3 p-2 bg-secondary/50 rounded text-center">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-muted-foreground">Backend</span>
            <div className="flex items-center gap-1">
              <span className={cn(
                "inline-block w-1.5 h-1.5 rounded-full",
                backendStatus === 'online' ? "bg-risk-low animate-pulse" : "bg-red-500"
              )}></span>
              <span className={cn(
                "font-bold",
                backendStatus === 'online' ? "text-risk-low" : "text-red-500"
              )}>
                {backendStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
