import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import api from "../../lib/axios";
import type { AuthResponse } from "./types";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const savedEmail = localStorage.getItem("rememberedEmail") || "";
  const savedPassword = localStorage.getItem("rememberedPassword") || "";
  const savedRememberMe = localStorage.getItem("rememberMe") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: savedEmail,
      password: savedPassword,
      rememberMe: savedRememberMe,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (data.rememberMe) {
        localStorage.setItem("rememberedEmail", data.email);
        localStorage.setItem("rememberedPassword", data.password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        localStorage.setItem("rememberMe", "false");
      }

      login(response.data);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Invalid email or password. Please try again.";

      if (err.response?.status === 403) {
        toast.error(message, {
          duration: 5000,
          id: "deactivated-account",
        });
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          {/* <h1 className="text-4xl font-extrabold text-primary mb-2">Arovia</h1> */}

          <img
            src="../../public/AroviaLogo.svg"
            alt="Arovia"
            className="w-50 mx-auto"
          />
          {/* Arovia */}

          <p className="text-slate-500">Healthcare Management Reimagined</p>
        </div>
        {/* <Card
          title="Welcome Back"
          description="Login to your provider dashboard"
        > */}

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="e.g., doctor@arovia.com"
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={errors.password?.message}
              placeholder="••••••••"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none focus:text-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
            />

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-slate-700"
              >
                Remember Me
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Forgot password? Contact your Clinic Administrator.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
