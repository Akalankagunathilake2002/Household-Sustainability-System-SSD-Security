import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  const code = searchParams.get("code");
  const [exchangeError, setExchangeError] = useState("");
  const exchangeStarted = useRef(false);

  const error = code
    ? exchangeError
    : "No authorization code was received. Please try signing in again.";

  useEffect(() => {
    // The exchange code is single-use. React StrictMode runs effects twice in
    // development, and a second exchange would fail with "already used".
    if (!code || exchangeStarted.current) return;
    exchangeStarted.current = true;

    const exchangeCode = async () => {
      try {
        const res = await api.post(
          API_ENDPOINTS.AUTH.GOOGLE_EXCHANGE,
          { code },
          { timeout: 15000 }
        );

        const result = loginWithToken(res.data.token, res.data.user);

        if (result.success) {
          // replace: true drops the ?code=... URL from the browser history
          navigate(result.role === "admin" ? "/admin" : "/dashboard", {
            replace: true,
          });
        } else {
          setExchangeError(result.error);
        }
      } catch (err) {
        const data = err.response?.data;
        setExchangeError(
          data?.message ||
            data?.msg ||
            (err.response
              ? "Google sign-in failed. Please try again."
              : "Unable to reach the server. Please try again.")
        );
      }
    };

    exchangeCode();
  }, [code, navigate, loginWithToken]);

  return (
    <AuthLayout
      title={error ? "Sign-in failed" : "Signing you in"}
      subtitle={
        error
          ? "We couldn't complete your Google sign-in"
          : "Completing your Google sign-in, one moment..."
      }
      linkText="Don't have an account?"
      linkPath="/register"
      linkActionText="Create one"
    >
      {error ? (
        <div className="space-y-5">
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm flex items-start gap-3 shadow-sm"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>

          <Link
            to="/login"
            className="block w-full py-3.5 rounded-2xl bg-gradient-to-r from-forest-dark to-deep-eco text-white font-semibold text-base text-center shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <div role="status" className="flex justify-center py-6">
          <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </AuthLayout>
  );
};

export default OAuthCallback;
