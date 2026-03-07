import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, Globe, Settings as SettingsIcon, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getNotificationStatus,
  sendRegionAlert,
  testAlertNotification,
  testEmailNotification,
  testSMSNotification,
  type AlertTestRequest,
} from "@/services/api";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || "http://localhost:8000");

  const [emailForm, setEmailForm] = useState({
    to_email: "",
    subject: "Test Email",
    message: "This is a test email from GeoSentinel",
  });

  const [smsForm, setSmsForm] = useState({
    to_phone: "",
    message: "This is a test SMS from GeoSentinel",
  });

  const [alertForm, setAlertForm] = useState<AlertTestRequest>({
    user_email: "",
    user_phone: "",
    user_name: "",
    region: "Uttarakhand",
    probability: 0.85,
    risk_level: "HIGH",
  });

  const [regionAlertForm, setRegionAlertForm] = useState({
    region: "Uttarakhand",
    probability: 0.85,
    risk_level: "HIGH" as "LOW" | "MEDIUM" | "HIGH",
  });

  const [lastResponse, setLastResponse] = useState<unknown>(null);

  const statusQuery = useQuery({
    queryKey: ["notification-status"],
    queryFn: getNotificationStatus,
    refetchInterval: 30000,
  });

  const emailMutation = useMutation({
    mutationFn: testEmailNotification,
    onSuccess: (data) => {
      setLastResponse(data);
      toast.success("Email test sent", { description: String(data.message || "Success") });
    },
    onError: (error: any) => {
      toast.error("Email test failed", { description: error?.response?.data?.detail || error?.message });
    },
  });

  const smsMutation = useMutation({
    mutationFn: testSMSNotification,
    onSuccess: (data) => {
      setLastResponse(data);
      toast.success("SMS test sent", { description: String(data.message || "Success") });
    },
    onError: (error: any) => {
      toast.error("SMS test failed", { description: error?.response?.data?.detail || error?.message });
    },
  });

  const alertMutation = useMutation({
    mutationFn: testAlertNotification,
    onSuccess: (data) => {
      setLastResponse(data);
      toast.success("Alert test completed");
    },
    onError: (error: any) => {
      toast.error("Alert test failed", { description: error?.response?.data?.detail || error?.message });
    },
  });

  const regionAlertMutation = useMutation({
    mutationFn: () =>
      sendRegionAlert(regionAlertForm.region, regionAlertForm.probability, regionAlertForm.risk_level),
    onSuccess: (data) => {
      setLastResponse(data);
      toast.success("Region alert completed");
    },
    onError: (error: any) => {
      toast.error("Region alert failed", { description: error?.response?.data?.detail || error?.message });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-wider flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-sm font-mono text-muted-foreground mt-1">
          Configure application preferences and test notification endpoints
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="font-mono text-xs">Manage how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Enable Notifications</Label>
                <p className="text-xs font-mono text-muted-foreground">Receive browser notifications for alerts</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Email Alerts</Label>
                <p className="text-xs font-mono text-muted-foreground">Get HIGH-risk alerts via email</p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">SMS Alerts</Label>
                <p className="text-xs font-mono text-muted-foreground">Receive critical alerts via SMS</p>
              </div>
              <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              API Configuration
            </CardTitle>
            <CardDescription className="font-mono text-xs">Backend server connection settings</CardDescription>
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
                Current env URL: {import.meta.env.VITE_API_URL || "http://localhost:8000"}
              </p>
            </div>
            <Button className="w-full font-mono" onClick={() => statusQuery.refetch()} disabled={statusQuery.isFetching}>
              {statusQuery.isFetching ? "Checking..." : "Refresh Notification Status"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">Notification Service Status</CardTitle>
            <CardDescription className="font-mono text-xs">GET /notifications/status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="rounded border p-3 bg-muted/30">
              <p>Email: {statusQuery.data?.email?.enabled ? "enabled" : "disabled"}</p>
              <p>Email configured: {statusQuery.data?.email?.configured ? "yes" : "no"}</p>
              <p>SMTP server: {String(statusQuery.data?.email?.server || "-")}</p>
              <p>From email: {String(statusQuery.data?.email?.from_email || "-")}</p>
            </div>
            <div className="rounded border p-3 bg-muted/30">
              <p>SMS: {statusQuery.data?.sms?.enabled ? "enabled" : "disabled"}</p>
              <p>SMS configured: {statusQuery.data?.sms?.configured ? "yes" : "no"}</p>
              <p>Provider: {String(statusQuery.data?.sms?.provider || "-")}</p>
              <p>From phone: {String(statusQuery.data?.sms?.from_phone || "-")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">Test Email Notification</CardTitle>
            <CardDescription className="font-mono text-xs">POST /notifications/test/email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="to_email"
              value={emailForm.to_email}
              onChange={(e) => setEmailForm((prev) => ({ ...prev, to_email: e.target.value }))}
              className="font-mono text-xs"
            />
            <Input
              placeholder="subject"
              value={emailForm.subject}
              onChange={(e) => setEmailForm((prev) => ({ ...prev, subject: e.target.value }))}
              className="font-mono text-xs"
            />
            <Textarea
              placeholder="message"
              value={emailForm.message}
              onChange={(e) => setEmailForm((prev) => ({ ...prev, message: e.target.value }))}
              className="font-mono text-xs"
            />
            <Button
              className="w-full font-mono"
              disabled={emailMutation.isPending}
              onClick={() => emailMutation.mutate(emailForm)}
            >
              {emailMutation.isPending ? "Sending..." : "Send Test Email"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">Test SMS Notification</CardTitle>
            <CardDescription className="font-mono text-xs">POST /notifications/test/sms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="to_phone (+919999999999)"
              value={smsForm.to_phone}
              onChange={(e) => setSmsForm((prev) => ({ ...prev, to_phone: e.target.value }))}
              className="font-mono text-xs"
            />
            <Textarea
              placeholder="message"
              value={smsForm.message}
              onChange={(e) => setSmsForm((prev) => ({ ...prev, message: e.target.value }))}
              className="font-mono text-xs"
            />
            <Button className="w-full font-mono" disabled={smsMutation.isPending} onClick={() => smsMutation.mutate(smsForm)}>
              {smsMutation.isPending ? "Sending..." : "Send Test SMS"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">Test Complete Alert</CardTitle>
            <CardDescription className="font-mono text-xs">POST /notifications/test/alert</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="user_email"
              value={alertForm.user_email}
              onChange={(e) => setAlertForm((prev) => ({ ...prev, user_email: e.target.value }))}
              className="font-mono text-xs"
            />
            <Input
              placeholder="user_phone"
              value={alertForm.user_phone}
              onChange={(e) => setAlertForm((prev) => ({ ...prev, user_phone: e.target.value }))}
              className="font-mono text-xs"
            />
            <Input
              placeholder="user_name"
              value={alertForm.user_name}
              onChange={(e) => setAlertForm((prev) => ({ ...prev, user_name: e.target.value }))}
              className="font-mono text-xs"
            />
            <Input
              placeholder="region"
              value={alertForm.region}
              onChange={(e) => setAlertForm((prev) => ({ ...prev, region: e.target.value }))}
              className="font-mono text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={alertForm.probability}
                onChange={(e) => setAlertForm((prev) => ({ ...prev, probability: Number(e.target.value) }))}
                className="font-mono text-xs"
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                value={alertForm.risk_level}
                onChange={(e) =>
                  setAlertForm((prev) => ({ ...prev, risk_level: e.target.value as "LOW" | "MEDIUM" | "HIGH" }))
                }
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
            <Button className="w-full font-mono" disabled={alertMutation.isPending} onClick={() => alertMutation.mutate(alertForm)}>
              {alertMutation.isPending ? "Sending..." : "Test Full Alert"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">Send Region Alert</CardTitle>
            <CardDescription className="font-mono text-xs">
              POST /notifications/send-region-alert/{"{"}region{"}"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="region"
              value={regionAlertForm.region}
              onChange={(e) => setRegionAlertForm((prev) => ({ ...prev, region: e.target.value }))}
              className="font-mono text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={regionAlertForm.probability}
                onChange={(e) => setRegionAlertForm((prev) => ({ ...prev, probability: Number(e.target.value) }))}
                className="font-mono text-xs"
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                value={regionAlertForm.risk_level}
                onChange={(e) =>
                  setRegionAlertForm((prev) => ({ ...prev, risk_level: e.target.value as "LOW" | "MEDIUM" | "HIGH" }))
                }
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
            <Button
              className="w-full font-mono"
              disabled={regionAlertMutation.isPending}
              onClick={() => regionAlertMutation.mutate()}
            >
              {regionAlertMutation.isPending ? "Sending..." : "Send Region Alert"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-mono text-base flex items-center gap-2 text-primary">
              <Shield className="w-4 h-4" />
              Last API Response
            </CardTitle>
            <CardDescription className="font-mono text-xs">Useful for validating response payloads</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all rounded border p-3 bg-background">
              {JSON.stringify(lastResponse, null, 2) || "Run a notification test to see API response here."}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
