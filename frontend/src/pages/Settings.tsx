import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Bell, Globe, Shield } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-wider flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-sm font-mono text-muted-foreground mt-1">
          Configure application preferences and API settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Manage how you receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Enable Notifications</Label>
                <p className="text-xs font-mono text-muted-foreground">
                  Receive browser notifications for alerts
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Email Alerts</Label>
                <p className="text-xs font-mono text-muted-foreground">
                  Get HIGH-risk alerts via email
                </p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">SMS Alerts</Label>
                <p className="text-xs font-mono text-muted-foreground">
                  Receive critical alerts via SMS
                </p>
              </div>
              <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              API Configuration
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Backend server connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url" className="font-mono text-xs">
                Backend API URL
              </Label>
              <Input
                id="api-url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="font-mono"
                placeholder="http://localhost:8000"
              />
              <p className="text-[10px] font-mono text-muted-foreground">
                Current: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
              </p>
            </div>

            <Button className="w-full font-mono">Test Connection</Button>
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Account Settings
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              User profile and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name" className="font-mono text-xs">
                Display Name
              </Label>
              <Input
                id="user-name"
                defaultValue={JSON.parse(localStorage.getItem('geosentinel_user') || '{}').name || ''}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email" className="font-mono text-xs">
                Email Address
              </Label>
              <Input
                id="user-email"
                type="email"
                defaultValue={JSON.parse(localStorage.getItem('geosentinel_user') || '{}').email || ''}
                className="font-mono"
              />
            </div>

            <Button className="w-full font-mono">Update Profile</Button>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="bg-primary/5 border-primary/30">
          <CardHeader>
            <CardTitle className="font-mono text-base text-primary">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-bold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend Status:</span>
              <span className="font-bold text-risk-low">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Sync:</span>
              <span className="font-bold">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-bold">99.8%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
