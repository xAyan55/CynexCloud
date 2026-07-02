import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAvatarUrl } from "../utils/avatar";
import { 
  Bell, 
  Menu, 
  Search, 
  ChevronDown, 
  User, 
  Settings, 
  Shield, 
  LogOut,
  HelpCircle
} from "lucide-react";

interface TopNavProps {
  setMobileOpen: (open: boolean) => void;
  onSearchOpen: () => void;
}

export default function TopNav({ setMobileOpen, onSearchOpen }: TopNavProps) {
  const { user, logout, authFetch } = useAuth();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState("/images/pfp/Circle/OSLO-1.png");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Dynamic avatar fetch
  useEffect(() => {
    if (user) {
      getAvatarUrl(user.email, user.id).then(setAvatarUrl);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await authFetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30s to keep it real-time
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const res = await authFetch("/api/notifications/read-all", { method: "POST" });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Format path breadcrumbs (e.g. /dashboard/servers -> Dashboard / Servers)
  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(p => p);
    return paths.map((p, idx) => {
      const label = p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ");
      const to = "/" + paths.slice(0, idx + 1).join("/");
      const isLast = idx === paths.length - 1;

      return (
        <span key={to} className="flex items-center gap-1.5 text-xs">
          {idx > 0 && <span className="text-zinc-700">/</span>}
          {isLast ? (
            <span className="font-semibold text-white">{label}</span>
          ) : (
            <Link to={to} className="hover:text-zinc-300 transition-colors">{label}</Link>
          )}
        </span>
      );
    });
  };

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 select-none">
      {/* Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
          {getBreadcrumbs()}
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Search Launcher */}
          <button 
            onClick={onSearchOpen}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all text-sm font-medium w-36 sm:w-48 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search...</span>
            <span className="hidden md:inline-block text-[10px] bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 font-mono font-medium">
              ⌘K
            </span>
          </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800/80 text-zinc-400 hover:text-white transition-all relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.read) && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-1 z-50 select-none">
              <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Notifications</span>
                {notifications.some(n => !n.read) && (
                  <button 
                    onClick={handleMarkAllRead} 
                    className="text-[9px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-zinc-950 border-b border-zinc-800/50 last:border-b-0 transition-colors">
                      <div className="flex justify-between items-start gap-1">
                        <h5 className="text-xs font-semibold text-white mb-0.5">{notif.title}</h5>
                        {!notif.read && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 mb-1 leading-normal">{notif.message}</p>
                      <span className="text-[9px] text-zinc-650 font-bold">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-zinc-550 font-bold">
                    No new notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-6 bg-zinc-850" />

        {/* User Dropdown Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer group"
          >
            <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-zinc-800 group-hover:border-zinc-700 transition-colors" />
            <span className="hidden md:inline-block text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">{user?.username}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
              <div className="px-4 py-3 border-b border-zinc-800">
                <p className="text-xs font-bold text-white truncate mb-0.5">{user?.username}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link to="/dashboard/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer">
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </Link>
                <Link to="/dashboard/security" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Security</span>
                </Link>
                <Link to="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
                <div className="h-[1px] bg-zinc-800 my-1" />
                <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.03] transition-all cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
