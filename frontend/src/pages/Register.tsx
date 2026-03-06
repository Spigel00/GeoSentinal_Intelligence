import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, User, Phone, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    organization: "",
    role: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
        },
        (error) => {
          setError("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError("Please fill in all required fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please enter and confirm your password");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.organization || !formData.role) {
      setError("Please fill in organization and role");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError("Please fill in all location fields");
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError("Please enter a valid 6-digit pincode");
      return false;
    }
    if (!formData.latitude || !formData.longitude) {
      setError("Please provide your GPS coordinates or use 'Get Current Location'");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      // Store user data
      const userData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        organization: formData.organization,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
      };

      localStorage.setItem("geosentinel_auth", "authenticated");
      localStorage.setItem("geosentinel_user", JSON.stringify(userData));
      
      setIsLoading(false);
      navigate("/");
    }, 1500);
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
            Create your account to receive location-based alerts
          </CardDescription>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    step === i
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                      : step > i
                      ? "bg-primary/50 text-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div className={`w-8 h-0.5 ${step > i ? "bg-primary" : "bg-secondary"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 text-[9px] font-mono text-muted-foreground">
            <span className={step === 1 ? "text-primary font-bold" : ""}>Personal</span>
            <span className={step === 2 ? "text-primary font-bold" : ""}>Security</span>
            <span className={step === 3 ? "text-primary font-bold" : ""}>Location</span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* Registration Info */}
            <Alert className="py-2 bg-primary/10 border-primary/30">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <AlertDescription className="text-xs text-primary">
                <strong>Location Required:</strong> We need your location for precise landslide alerts
              </AlertDescription>
            </Alert>

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-mono">
                    Full Name <span className="text-risk-high">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="pl-10 font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-mono">
                      Email Address <span className="text-risk-high">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="pl-10 font-mono text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-mono">
                      Phone Number <span className="text-risk-high">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="pl-10 font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Security & Organization */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-mono">
                    Password <span className="text-risk-high">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pl-10 pr-10 font-mono text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-mono">
                    Confirm Password <span className="text-risk-high">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 font-mono text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="text-xs font-mono">
                      Organization <span className="text-risk-high">*</span>
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="organization"
                        type="text"
                        placeholder="Your organization"
                        value={formData.organization}
                        onChange={(e) => handleChange("organization", e.target.value)}
                        className="pl-10 font-mono text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-mono">
                      Role <span className="text-risk-high">*</span>
                    </Label>
                    <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                      <SelectTrigger className="font-mono text-sm">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resident">Resident</SelectItem>
                        <SelectItem value="emergency">Emergency Responder</SelectItem>
                        <SelectItem value="official">Government Official</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location Information */}
            {step === 3 && (
              <div className="space-y-4">
                <Alert className="py-2 bg-accent/10 border-accent/30">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  <AlertDescription className="text-xs text-accent">
                    Your precise location helps us send you targeted alerts for your area
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-mono">
                    Street Address <span className="text-risk-high">*</span>
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="House No., Street, Area"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="font-mono text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs font-mono">
                      City <span className="text-risk-high">*</span>
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs font-mono">
                      State <span className="text-risk-high">*</span>
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className="font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-xs font-mono">
                      Pincode <span className="text-risk-high">*</span>
                    </Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="000000"
                      value={formData.pincode}
                      onChange={(e) => handleChange("pincode", e.target.value)}
                      className="font-mono text-sm"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-mono">
                    GPS Coordinates <span className="text-risk-high">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="Latitude"
                      value={formData.latitude}
                      onChange={(e) => handleChange("latitude", e.target.value)}
                      className="font-mono text-sm"
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Longitude"
                      value={formData.longitude}
                      onChange={(e) => handleChange("longitude", e.target.value)}
                      className="font-mono text-sm"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full font-mono text-xs mt-2"
                    onClick={getCurrentLocation}
                  >
                    <MapPin className="h-3 w-3 mr-2" />
                    Get Current Location
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setError(""); setStep(step - 1); }}
                  className="flex-1 font-mono"
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 font-mono font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : step === 3 ? (
                  "Create Account"
                ) : (
                  "Next Step"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs">
            <span className="font-mono text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-mono text-primary hover:text-primary/80 transition-colors font-semibold">
              Sign In
            </Link>
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

export default Register;
