import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (result.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your account and continue your journey"
      linkText="Don't have an account?"
      linkPath="/register"
      linkActionText="Create one"
    >
      <div className="w-full">
        <div className="mb-6 rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md shadow-lg p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-teal/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="text-primary-teal" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-forest-dark">
              Secure Login
            </h3>
            <p className="text-sm text-text-muted mt-1">
              Enter your credentials to securely access your dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm flex items-start gap-3 shadow-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-forest-dark">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-teal transition-colors"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-white/90 text-text-main placeholder:text-text-muted shadow-sm transition-all duration-200 focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10 hover:shadow-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-forest-dark">
              Password
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-teal transition-colors"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-border bg-white/90 text-text-main placeholder:text-text-muted shadow-sm transition-all duration-200 focus:outline-none focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/10 hover:shadow-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-teal transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-text-main select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary-teal focus:ring-primary-teal"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-primary-teal font-semibold hover:text-forest-dark transition-colors hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-forest-dark to-deep-eco text-white font-semibold text-base shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="pt-2">
            <p className="text-center text-sm text-text-muted">
              New here?{" "}
              <Link
                to="/register"
                className="text-primary-teal font-semibold hover:text-forest-dark transition-colors hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;