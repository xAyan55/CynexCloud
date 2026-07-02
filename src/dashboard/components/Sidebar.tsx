import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  LayoutDashboard, 
  Gamepad2, 
  Server, 
  PlusCircle, 
  Archive, 
  Database, 
  Calendar, 
  Users, 
  Receipt, 
  HelpCircle, 
  Megaphone, 
  BookOpen, 
  User, 
  Settings, 
  Shield, 
  Key, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  History
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "Services",
      items: [
        { path: "/dashboard/services", label: "Services", icon: Gamepad2 }
      ]
    },
    {
      title: "Account",
      items: [
        { path: "/dashboard/invoices", label: "Invoices", icon: Receipt },
        { path: "/dashboard/payment-history", label: "Payment History", icon: History },
        { path: "/dashboard/support", label: "Support", icon: HelpCircle },
        { path: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
        { path: "/dashboard/knowledge-base", label: "Knowledgebase", icon: BookOpen }
      ]
    },
    {
      title: "Settings",
      items: [
        { path: "/dashboard/profile", label: "Profile", icon: User },
        { path: "/dashboard/security", label: "Security", icon: Shield },
        { path: "/dashboard/api-keys", label: "API Keys", icon: Key },
        { path: "/dashboard/settings", label: "Settings", icon: Settings }
      ]
    }
  ];

  // If admin, append Admin Panel to the bottom as a separate category
  if (user?.role === "admin") {
    menuGroups.push({
      title: "Admin",
      items: [
        { path: "/dashboard/admin/config", label: "Pterodactyl Config", icon: Settings },
        { path: "/dashboard/admin/plans", label: "Plan Management", icon: LayoutDashboard },
        { path: "/dashboard/admin/tickets", label: "Manage Tickets", icon: HelpCircle },
        { path: "/dashboard/admin/users", label: "Manage Users", icon: Users }
      ]
    });
  }

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 text-zinc-400 select-none">
      <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-800">
        <Link to="/" className="flex items-center gap-3">
          <img src="/images/main-imgs/cynex-tp.png" alt="Logo" className="w-7 h-7 object-contain" />
          {!collapsed && (
            <span className="font-heading font-bold text-white text-base tracking-tight">
              Cynex<span className="text-zinc-400">Cloud</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)} 
            className="hidden md:flex p-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800/80 text-zinc-500 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-none">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-2">
            {!collapsed && (
              <h4 className="px-3 text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
                {group.title}
              </h4>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                return (
                  <li key={itemIdx}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group cursor-pointer ${
                        active 
                          ? "bg-white/[0.04] text-white" 
                          : "hover:bg-white/[0.02] text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r" />
                      )}

                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                      
                      {!collapsed && (
                        <span>{item.label}</span>
                      )}

                      {collapsed && (
                        <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 text-white text-xs font-medium py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-zinc-800 space-y-1">
        {collapsed && (
          <button 
            onClick={() => setCollapsed(false)} 
            className="w-full flex items-center justify-center p-2.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.04] transition-all relative group cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-zinc-500 group-hover:text-red-400" />
          {!collapsed && <span>Logout</span>}
          {collapsed && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 text-red-400 text-xs font-medium py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className={`hidden md:block shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${collapsed ? "w-16" : "w-60"}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 pointer-events-none ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0"}`}>
        {/* Backdrop overlay */}
        <div 
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        {/* Sliding Panel */}
        <div className={`absolute left-0 top-0 bottom-0 w-64 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
