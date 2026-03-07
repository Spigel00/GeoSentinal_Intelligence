import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, AlertCircle, User, Mail, Phone, MapPin, Users, Ambulance } from "lucide-react";
import { registerUser, type User as ApiUser } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type UserRole = "civilian" | "admin" | "rescue";

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  region: string;
  role: UserRole;
}

const ROLES: { id: UserRole; name: string; description: string; icon: any; color: string }[] = [
  {
    id: "civilian",
    name: "Civilian User",
    description: "Receive safety advisories and alerts",
    icon: User,
    color: "bg-blue-500/20 border-blue-500/50 text-blue-700",
  },
  {
    id: "admin",
    name: "Defense Admin",
    description: "Manage operations and view predictions",
    icon: Shield,
    color: "bg-green-500/20 border-green-500/50 text-green-700",
  },
  {
    id: "rescue",
    name: "Rescue Team",
    description: "Emergency response coordination",
    icon: Ambulance,
    color: "bg-red-500/20 border-red-500/50 text-red-700",
  },
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    region: "",
    role: "civilian",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    const normalizedPhone = formData.phone.replace(/\D/g, "");
    if (normalizedPhone.length < 10) {
      setError("Phone must be at least 10 characters");
      return false;
    }

    if (!formData.region.trim()) {
      setError("Region is required");
      return false;
    }

    if (!formData.role) {
      setError("Please select a user role");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload: ApiUser = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        region: formData.region.trim(),
      };

      const registeredUser = await registerUser(payload);

      localStorage.setItem("geosentinel_auth", "authenticated");
      localStorage.setItem("geosentinel_user", JSON.stringify({
        ...registeredUser,
        role: formData.role,
      }));

      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 scanline opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <Shield className="w-14 h-14 text-primary" />
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
            Register using backend schema: name, email, phone, region
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-mono">
                Name <span className="text-risk-high">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10 font-mono text-sm"
                  required
                  minLength={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-mono">
                Email <span className="text-risk-high">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="name@example.com"
                  className="pl-10 font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-mono">
                Phone <span className="text-risk-high">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="At least 10 digits"
                  className="pl-10 font-mono text-sm"
                  required
                  minLength={10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-xs font-mono">
                Region <span className="text-risk-high">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="region"
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleChange("region", e.target.value)}
                  placeholder="e.g. Nilgiris"
                  className="pl-10 font-mono text-sm"
                  required
                  minLength={1}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-mono">
                Select Your Role <span className="text-risk-high">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-left",
                      formData.role === role.id
                        ? `${role.color} border-current font-semibold`
                        : "border-border bg-muted/30 hover:border-border-focus"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <role.icon className="w-4 h-4" />
                      <div>
                        <p className="text-xs font-semibold">{role.name}</p>
                        <p className="text-[10px] opacity-70">{role.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full font-mono text-xs" disabled={isLoading}>
              {isLoading ? "Registering..." : "Create Account"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-mono">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
