import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Cloud, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import config from "@/config.json"

type AuthMode = "login" | "register" | "forgot-password" | "reset-password" | "verify-email"

export default function AuthPage() {
  const { login, register, forgotPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  const [mode, setMode] = useState<AuthMode>(() => {
    const path = location.pathname
    if (path === "/register") return "register"
    if (path === "/forgot-password") return "forgot-password"
    if (path === "/reset-password") return "reset-password"
    if (path === "/verify-email") return "verify-email"
    return "login"
  })

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      if (mode === "login") {
        const result = await login(email, password)
        if (result.success) navigate("/dashboard")
        else setError(result.error || "Login failed")
      } else if (mode === "register") {
        if (password !== confirmPassword) { setError("Passwords don't match"); setLoading(false); return }
        const result = await register(username, email, password, confirmPassword)
        if (result.success) {
          setMessage(result.message || "Registration successful! Please check your email to verify your account.")
          setTimeout(() => setMode("login"), 3000)
        } else setError(result.error || "Registration failed")
      } else if (mode === "forgot-password") {
        const result = await forgotPassword(email)
        if (result.success) setMessage(result.message || "Check your email for reset instructions.")
        else setError(result.error || "Request failed")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold font-heading">{config.brand.name}<span className="text-muted-foreground">{config.brand.suffix}</span></span>
          </Link>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>
              {mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : mode === "forgot-password" ? "Reset password" : "Check email"}
            </CardTitle>
            <CardDescription>
              {mode === "login" ? "Sign in to your account" : mode === "register" ? "Get started with a free account" : "Enter your email to receive reset instructions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">{error}</div>}
            {message && <div className="text-sm text-foreground bg-accent rounded-lg p-3 mb-4">{message}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "register" && (
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="username" placeholder="Your username" className="pl-10" value={username} onChange={e => setUsername(e.target.value)} required />
                  </div>
                </div>
              )}
              {(mode === "login" || mode === "register" || mode === "forgot-password") && (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="your@email.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
              )}
              {(mode === "login" || mode === "register") && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              {mode === "register" && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"}
              </Button>
            </form>

            <Separator className="my-4" />

            <div className="flex flex-col gap-2 text-sm text-center">
              {mode === "login" ? (
                <>
                  <Link to="/register" className="text-muted-foreground hover:text-foreground">Don't have an account? Sign up</Link>
                  <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot your password?</Link>
                </>
              ) : mode === "register" ? (
                <Link to="/login" className="text-muted-foreground hover:text-foreground">Already have an account? Sign in</Link>
              ) : (
                <Link to="/login" className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to sign in
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
