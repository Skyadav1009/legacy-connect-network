import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, GraduationCap, Users, Building2, BookOpen } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block text-center text-primary-foreground">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4">LegacyLink</h1>
            <p className="text-xl opacity-90 mb-8">
              Connect. Mentor. Grow Together.
            </p>
            <p className="text-lg opacity-75">
              The premier alumni networking platform connecting students, alumni, 
              faculty, and industry professionals.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Students</h3>
              <p className="text-sm opacity-75">Access career guidance and mentorship</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Alumni</h3>
              <p className="text-sm opacity-75">Share knowledge and expand network</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Faculty</h3>
              <p className="text-sm opacity-75">Connect with industry professionals</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Employers</h3>
              <p className="text-sm opacity-75">Recruit top talent from our network</p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-elegant border-0 bg-gradient-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your LegacyLink account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="transition-all duration-300 focus:shadow-card"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pr-10 transition-all duration-300 focus:shadow-card"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link 
                    to="/auth/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link 
                    to="/auth/register" 
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Demo Accounts:</h4>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Student:</span> student1@example.com</div>
              <div><span className="font-medium">Alumni:</span> alumni1@example.com</div>
              <div><span className="font-medium">Password:</span> Passw0rd!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}