import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  csrfToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Perform silent token refresh on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
          // Set simple CSRF header token from cookie or extract from payload if returned
          setCsrfToken(data.csrfToken || "csrf_placeholder");
        }
      } catch (err) {
        console.warn("Authentication initialization failed (unauthenticated session).");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Periodic Refresh Token Renewal (Every 12 minutes before the 15m Access Token expires)
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
        } else {
          // Token expired or revoked
          setAccessToken(null);
          setUser(null);
        }
      } catch {
        console.warn("Failed silent token refresh check.");
      }
    }, 12 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed." };
      }

      setAccessToken(data.accessToken);
      setCsrfToken(data.csrfToken);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error occurred." };
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed." };
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: "Network error occurred." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    setAccessToken(null);
    setUser(null);
    setCsrfToken(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: "Connection error." };
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: "Connection error." };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: "Connection error." };
    }
  };

  // Custom fetch wrapper that appends JWT token & handles silent automatic retries on 401
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
    
    const updatedOptions = { ...options, headers };
    let res = await fetch(url, updatedOptions);

    // If access token expired, try to renew using refresh token and retry the query
    if (res.status === 401) {
      try {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
          
          // Retry original request
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          if (data.csrfToken) {
            headers.set("X-CSRF-Token", data.csrfToken);
            setCsrfToken(data.csrfToken);
          }
          res = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed, clean session
          setAccessToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Token silent retry failed:", err);
      }
    }

    return res;
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      csrfToken,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      authFetch
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
