import { useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, Server, Upload, Users,
  FileText, History, Ticket, Megaphone, User, Shield, Key, Settings,
  ChevronLeft, ChevronRight, LogOut, PanelTop, Package, Tickets
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import config from "@/config.json"

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Services", icon: Server, path: "/dashboard/services" },
  { label: "Deploy", icon: Upload, path: "/dashboard/deploy" },
  { label: "Invoices", icon: FileText, path: "/dashboard/invoices" },
  { label: "Payment History", icon: History, path: "/dashboard/payment-history" },
  { label: "Support Tickets", icon: Ticket, path: "/dashboard/support" },
  { label: "Announcements", icon: Megaphone, path: "/dashboard/announcements" },
]

const SETTINGS_ITEMS = [
  { label: "Profile", icon: User, path: "/dashboard/profile" },
  { label: "Security", icon: Shield, path: "/dashboard/security" },
  { label: "API Keys", icon: Key, path: "/dashboard/api-keys" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
]

const ADMIN_ITEMS = [
  { label: "Panel Config", icon: PanelTop, path: "/dashboard/admin/config" },
  { label: "Plans", icon: Package, path: "/dashboard/admin/plans" },
  { label: "Tickets", icon: Tickets, path: "/dashboard/admin/tickets" },
  { label: "Users", icon: Users, path: "/dashboard/admin/users" },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/")

  const NavItem = ({ label, icon: Icon, path }: { label: string; icon: any; path: string }) => {
    const active = isActive(path)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        <aside className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}>
          <div className="flex items-center justify-between p-3 h-14 border-b border-border">
            {!collapsed && (
              <span className="text-sm font-bold font-heading">{config.brand.name}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="shrink-0"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2 py-3">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => <NavItem key={item.path} {...item} />)}
            </div>

            <Separator className="my-3" />

            <div className="flex flex-col gap-1">
              {SETTINGS_ITEMS.map((item) => <NavItem key={item.path} {...item} />)}
            </div>

            {user?.role === "admin" && (
              <>
                <Separator className="my-3" />
                <div className="flex flex-col gap-1">
                  {!collapsed && <span className="text-xs font-semibold text-muted-foreground px-3 py-1 uppercase tracking-wider">Admin</span>}
                  {ADMIN_ITEMS.map((item) => <NavItem key={item.path} {...item} />)}
                </div>
              </>
            )}
          </ScrollArea>

          <div className="p-2 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent/50 transition-colors",
                  !collapsed && "px-3"
                )}>
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-muted text-foreground">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate w-full">{user?.username}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate("/") }}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
            <span className="text-sm font-medium text-foreground"></span>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                View Site
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="page-enter">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
