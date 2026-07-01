import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, EyeOff, ShieldAlert, KeyRound, Loader2, ArrowLeft, RefreshCw, 
  Server, Cpu, Database, CheckCircle2, AlertTriangle, Sparkles, Terminal, Globe, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token");
  
  const { login, register, forgotPassword, resetPassword, verifyEmail, user } = useAuth();

  // Mode: "login" | "register" | "forgot" | "reset" | "verify"
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset" | "verify">(
    tokenParam ? (window.location.pathname.includes("reset") ? "reset" : "verify") : "login"
  );

  // Form states
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  
  // Ref for password generation
  const passwordRef = useRef<HTMLInputElement>(null);

  // Verification auto-trigger
  useEffect(() => {
    if (mode === "verify" && tokenParam) {
      setLoading(true);
      verifyEmail(tokenParam).then(res => {
        setLoading(false);
        if (res.success) {
          setSuccessMessage(res.message || "Email verified! You can now log in.");
        } else {
          setError(res.error || "Email verification failed.");
        }
      });
    }
  }, [mode, tokenParam]);

  // If user is already logged in, redirect home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Caps Lock detector
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLock(true);
    } else {
      setCapsLock(false);
    }
  };

  // Password generator helper
  const generateSecurePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let generated = "";
    for (let i = 0; i < 16; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "Empty", color: "bg-zinc-800" };
    let score = 0;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>_]/.test(password)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Moderate", color: "bg-amber-500" };
    return { score, label: "Strong & Secure", color: "bg-cyan-400" };
  };

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
          // Clear inputs
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

  // Animated Server Ticker Logic for Right Panel
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[ OK ] Initialize CynexCloud hypervisor core v6.4.1",
    "[ OK ] Mounting NVMe SSD Array (RAID 10 partition)...",
    "[ OK ] Allocating 10Gbps dedicated fiber backplane...",
  ]);

  useEffect(() => {
    const logTemplates = [
      "[ OK ] Port forwarding verified for IP 185.220.12.98:25565",
      "[ OK ] Automated backup cluster snapshot synced (0.012ms)",
      "[PING] us-east.cynexcloud.eu.cc latency verified: 12ms",
      "[PING] eu-west.cynexcloud.eu.cc latency verified: 4ms",
      "[ OK ] Node hypervisor health checklist: 100% OK",
      "[INFO] Core CPU temp: 34°C - Fan speeds stable",
      "[SEC] DDoS mitigation scrubbers ACTIVE - 0 threats detected",
    ];

    const interval = setInterval(() => {
      const randomLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      setConsoleLogs(prev => [...prev.slice(-6), `${new Date().toLocaleTimeString()} ${randomLog}`]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row relative overflow-hidden select-none font-sans text-zinc-300">
      
      {/* LEFT SIDE: AUTH FORM PANEL (45%) */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12 relative z-10 bg-zinc-950/70 backdrop-blur-xl border-r border-white/5 min-h-screen">
        
        <div className="w-full max-w-[400px] mx-auto">
          {/* Logo header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <img src="/images/main-imgs/cynex-tp.png" alt="Logo" className="w-6 h-6 object-contain invert" />
            </div>
            <span className="text-lg font-black tracking-widest text-white uppercase">
              CYNEX<span className="text-zinc-500 font-light">CLOUD</span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Form title */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading mb-2">
                  {mode === "login" && "Welcome Back"}
                  {mode === "register" && "Create Account"}
                  {mode === "forgot" && "Reset Password"}
                  {mode === "reset" && "Specify Password"}
                  {mode === "verify" && "Email Verification"}
                </h2>
                <p className="text-zinc-500 text-xs sm:text-sm font-medium">
                  {mode === "login" && "Access your cloud instances and game servers."}
                  {mode === "register" && "Get started with enterprise hosting."}
                  {mode === "forgot" && "We will email you password recovery steps."}
                  {mode === "reset" && "Type your new account credentials."}
                  {mode === "verify" && "Validating activation tokens..."}
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs font-semibold flex items-start gap-3 shadow-lg">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-start gap-3 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {mode !== "verify" && (
                <form onSubmit={handleFormSubmit} className="space-y-5" onKeyDown={handleKeyDown}>
                  
                  {/* Username (Register) */}
                  {mode === "register" && (
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 text-white rounded-xl px-4 py-3.5 text-sm font-semibold transition-all placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/5"
                        placeholder="Username"
                        autoComplete="username"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Email */}
                  {(mode === "login" || mode === "register" || mode === "forgot") && (
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 text-white rounded-xl px-4 py-3.5 text-sm font-semibold transition-all placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/5"
                        placeholder="Email Address"
                        autoComplete="email"
                      />
                    </div>
                  )}

                  {/* Password */}
                  {(mode === "login" || mode === "register" || mode === "reset") && (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          ref={passwordRef}
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 text-white rounded-xl pl-4 pr-12 py-3.5 text-sm font-semibold transition-all placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/5"
                          placeholder="Password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>

                      {/* Caps Lock warning indicator */}
                      {capsLock && (
                        <div className="text-amber-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Caps Lock is ON</span>
                        </div>
                      )}

                      {/* Password helpers (Strength & Generator) */}
                      {mode === "register" && (
                        <div className="pt-1.5 space-y-3">
                          {/* strength meter */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              <span>Password Strength</span>
                              <span>{strength.label}</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden flex gap-0.5">
                              <div className={`h-full ${strength.color} transition-all`} style={{ width: `${Math.min(100, strength.score * 20)}%` }} />
                            </div>
                          </div>

                          {/* Generator CTA */}
                          <button
                            type="button"
                            onClick={generateSecurePassword}
                            className="text-[10px] font-black uppercase text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 tracking-wider"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Autogenerate Secure Password</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Password Confirm (Register/Reset) */}
                  {(mode === "register" || mode === "reset") && (
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 text-white rounded-xl px-4 py-3.5 text-sm font-semibold transition-all placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/5"
                        placeholder="Confirm Password"
                      />
                    </div>
                  )}

                  {/* Remember Me & Forgot Password (Login Only) */}
                  {mode === "login" && (
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-white/5 bg-zinc-900 checked:bg-white text-black transition-all"
                        />
                        <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">Remember Me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-[10px] h-auto border-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        <span>
                          {mode === "login" && "Login"}
                          {mode === "register" && "Create Account"}
                          {mode === "forgot" && "Send Reset Link"}
                          {mode === "reset" && "Update Password"}
                        </span>
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Loading Verification placeholder */}
              {mode === "verify" && loading && (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                  <span className="text-xs uppercase tracking-widest font-black">Decrypting verification key...</span>
                </div>
              )}

              {/* Mode togglers / footer footer */}
              <div className="mt-8 text-center text-xs font-semibold">
                {mode === "login" && (
                  <p className="text-zinc-500">
                    Don't have an account?{" "}
                    <button onClick={() => setMode("register")} className="text-white hover:underline">
                      Register Now
                    </button>
                  </p>
                )}
                {mode === "register" && (
                  <p className="text-zinc-500">
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-white hover:underline">
                      Log In
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
                    className="text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDE: PREMIUM HERO DISPLAY & SERVER METRICS (55%) */}
      <div className="hidden md:block w-[55%] relative min-h-screen">
        {/* Full screen Auth Image background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700" 
          style={{ backgroundImage: "url('/images/main-imgs/cc-auth-img.jpg')" }} 
        />
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/90 z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent z-0" />

        {/* Content overlay container */}
        <div className="absolute inset-0 flex flex-col justify-between p-16 z-10">
          
          {/* Header Stats */}
          <div className="flex justify-between items-start">
            <div className="flex gap-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Hypervisor Uptime</span>
                <span className="text-white font-black text-lg font-mono">99.998%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Network Backplane</span>
                <span className="text-cyan-400 font-black text-lg font-mono flex items-center gap-1.5">
                  <Globe className="w-4.5 h-4.5" />
                  <span>10 Gbps</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Global Nodes</span>
                <span className="text-white font-black text-lg font-mono">24/24 Online</span>
              </div>
            </div>
          </div>

          {/* Centerpiece: Marketing headline & live active logs */}
          <div className="max-w-[520px] space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-widest uppercase">
                <Lock className="w-3 h-3" />
                <span>Next-Gen Security Guard</span>
              </div>
              <h1 className="text-white font-black text-4xl sm:text-5xl uppercase tracking-tighter leading-[0.9] font-heading">
                Enterprise Cloud <br />
                Hosting Panel.
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Deploy game servers and container applications on AMD EPYC high-frequency infrastructure with built-in advanced DDoS shielding.
              </p>
            </div>

            {/* Live Server Console Ticker */}
            <div className="bg-black/60 border border-white/5 rounded-2xl p-6 backdrop-blur-2xl glass-dark font-mono text-[11px] leading-relaxed shadow-2xl relative overflow-hidden group">
              <div className="absolute top-2 right-4 flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2 text-zinc-400 border-b border-white/5 pb-3 mb-3">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold uppercase tracking-wider text-[9px]">Live Cluster Console logs</span>
              </div>
              <div className="space-y-1.5 h-[120px] overflow-hidden text-zinc-400">
                {consoleLogs.map((log, index) => (
                  <div key={index} className="truncate">
                    <span className="text-cyan-500">cynex-sys$</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <span>Powered by AMD Ryzen & EPYC</span>
            <span>Security certified node hypervisor</span>
          </div>

        </div>

      </div>

    </div>
  );
}
