import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain, UserPlus } from "lucide-react";
import { useLocation, Link } from "wouter";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/v2/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password
          }),
          credentials: 'include',
        });
        
        // Check if response has content
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }
        
        const responseText = await response.text();
        if (!responseText) {
          throw new Error("Empty response from server");
        }
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Response text:", responseText);
          throw new Error("Invalid JSON response from server");
        }
        
        if (!response.ok) {
          const msg = responseData?.error || "Registration failed";
          throw new Error(msg);
        }
        
        return responseData;
      } catch (error) {
        console.error("Registration request error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful!",
        description: `Welcome ${data.user.fullName}! You have been automatically logged in.`,
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="trivia-card shadow-2xl" data-testid="card-register">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 wine-gradient rounded-2xl flex items-center justify-center mx-auto">
              <Brain className="text-champagne-400 h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl wine-text mb-2" data-testid="text-register-title">
                Create Your Account
              </CardTitle>
              <p className="text-gray-600" data-testid="text-register-subtitle">
                Join TriviaSpark to manage trivia events
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name" data-testid="label-name">
                  Full Name
                </Label>
                <Input
                  id="name"
                  {...register("name", { required: "Full name is required" })}
                  placeholder="Enter your full name"
                  className={`mt-1 ${errors.name ? "border-red-500" : "focus:ring-2 focus:ring-wine-500 focus:border-transparent"}`}
                  data-testid="input-name"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1" data-testid="error-name">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" data-testid="label-email">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address"
                    }
                  })}
                  placeholder="Enter your email address"
                  className={`mt-1 ${errors.email ? "border-red-500" : "focus:ring-2 focus:ring-wine-500 focus:border-transparent"}`}
                  data-testid="input-email"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1" data-testid="error-email">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" data-testid="label-password">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long"
                    }
                  })}
                  placeholder="Enter your password"
                  className={`mt-1 ${errors.password ? "border-red-500" : "focus:ring-2 focus:ring-wine-500 focus:border-transparent"}`}
                  data-testid="input-password"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1" data-testid="error-password">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" data-testid="label-confirm-password">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: (value) => 
                      value === password || "Passwords do not match"
                  })}
                  placeholder="Confirm your password"
                  className={`mt-1 ${errors.confirmPassword ? "border-red-500" : "focus:ring-2 focus:ring-wine-500 focus:border-transparent"}`}
                  data-testid="input-confirm-password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1" data-testid="error-confirm-password">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full trivia-button-primary mt-6"
                data-testid="button-register"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-wine-600 hover:text-wine-700 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-wine-700 hover:text-wine-800"
            data-testid="button-back-home"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
