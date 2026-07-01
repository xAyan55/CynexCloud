import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token");
  
  const { login, register, forgotPassword, resetPassword, verifyEmail, user } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset" | "verify">(
    tokenParam ? (window.location.pathname.includes("reset") ? "reset" : "verify") : "login"
  );

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email verification trigger
  useEffect(() => {
    if (mode === "verify" && tokenParam) {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      verifyEmail(tokenParam).then(res => {
        setLoading(false);
        if (res.success) {
          setError(null);
          setSuccessMessage(res.message || "Email verified! You can now log in.");
        } else {
          setSuccessMessage(null);
          setError(res.error || "Email verification failed.");
        }
      });
    }
  }, [mode, tokenParam]);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (res.success) {
          navigate("/");
        } else {
          setError(res.error || "Login failed.");
        }
      } else if (mode === "register") {
        const res = await register(username, email, password, confirmPassword);
        if (res.success) {
          setSuccessMessage(res.message || "Registration successful! Check email to verify.");
          setMode("login");
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        } else {
          setError(res.error || "Registration failed.");
        }
      } else if (mode === "forgot") {
        const res = await forgotPassword(email);
        if (res.success) {
          setSuccessMessage(res.message || "Password reset instructions sent to your inbox.");
        } else {
          setError(res.error || "Request failed.");
        }
      } else if (mode === "reset" && tokenParam) {
        const res = await resetPassword(tokenParam, password, confirmPassword);
        if (res.success) {
          setSuccessMessage(res.message || "Password reset successful! You may now log in.");
          setMode("login");
        } else {
          setError(res.error || "Reset password failed.");
        }
      }
    } catch {
      setError("An unexpected connection issue occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row relative overflow-hidden select-none font-sans text-zinc-300">
      
      {/* LEFT SIDE: AUTH FORM PANEL (45%) */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12 relative z-10 bg-zinc-950 border-r border-white/5 min-h-screen">
        <div className="w-full max-w-[340px] mx-auto">
          
          {/* Logo Header */}
          <div className="mb-10">
            <img src="/images/main-imgs/cynex-tp.png" alt="Logo" className="w-7 h-7 object-contain invert" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Form title */}
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                  {mode === "login" && "Sign In"}
                  {mode === "register" && "Sign Up"}
                  {mode === "forgot" && "Reset Password"}
                  {mode === "reset" && "New Password"}
                  {mode === "verify" && "Verifying"}
                </h2>
                <p className="text-zinc-500 text-xs font-semibold">
                  {mode === "login" && "to CynexCloud"}
                  {mode === "register" && "to CynexCloud"}
                  {mode === "forgot" && "for CynexCloud"}
                  {mode === "reset" && "for CynexCloud"}
                  {mode === "verify" && "your CynexCloud account"}
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  {successMessage}
                </div>
              )}

              {mode !== "verify" && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Username (Register Only) */}
                  {mode === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-white/5 focus:border-white/20 text-white rounded-lg px-3.5 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-white/10"
                        placeholder="yourusername"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Email */}
                  {(mode === "login" || mode === "register" || mode === "forgot") && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        {mode === "login" ? "Username or email" : "Email address"}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-white/5 focus:border-white/20 text-white rounded-lg px-3.5 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-white/10"
                        placeholder="you@example.com"
                      />
                    </div>
                  )}

                  {/* Password */}
                  {(mode === "login" || mode === "register" || mode === "reset") && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Password</label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => setMode("forgot")}
                            className="text-[11px] text-zinc-500 hover:text-white transition-colors"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-white/5 focus:border-white/20 text-white rounded-lg pl-3.5 pr-10 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-white/10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password (Register/Reset Only) */}
                  {(mode === "register" || mode === "reset") && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Confirm Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-white/5 focus:border-white/20 text-white rounded-lg px-3.5 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-white/10"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-lg transition-all text-xs h-auto border-none flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Verify Email Loading State */}
              {mode === "verify" && loading && (
                <div className="flex flex-col items-center justify-center py-6 text-zinc-500 gap-2.5">
                  <Loader2 className="w-7 h-7 animate-spin text-white" />
                  <span className="text-xs font-semibold">Validating...</span>
                </div>
              )}

              {/* Mode Footer Switchers */}
              <div className="text-center text-xs font-semibold pt-4">
                {mode === "login" && (
                  <p className="text-zinc-500">
                    Don't have an account?{" "}
                    <button onClick={() => setMode("register")} className="text-white hover:underline">
                      Create one
                    </button>
                  </p>
                )}
                {mode === "register" && (
                  <p className="text-zinc-500">
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-white hover:underline">
                      Sign in
                    </button>
                  </p>
                )}
                {(mode === "forgot" || mode === "reset" || mode === "verify") && (
                  <button
                    onClick={() => {
                      setError(null);
                      setSuccessMessage(null);
                      setMode("login");
                    }}
                    className="text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to login</span>
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* RIGHT SIDE: CLEAN RAW HERO IMAGE (55%) */}
      <div className="hidden md:block w-[55%] relative min-h-screen animate-fade-in">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('/images/main-imgs/cc-auth-img.jpg')" }} 
        />
      </div>

    </div>
  );
}
