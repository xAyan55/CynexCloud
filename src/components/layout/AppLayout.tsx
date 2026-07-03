import { useState, useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Cloud, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import config from "@/config.json"
import { NAV_LINKS } from "@/constants"
import { useAuth } from "@/hooks/useAuth"

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const isActive = (href: string) => {
    if (href === "#" || href.startsWith("#")) return false
    return location.pathname === href
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-background/80 backdrop-blur-xl border-border py-3" : "bg-transparent border-transparent py-6"
      )}>
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              <img src={config.brand.logoUrl} alt={config.brand.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-lg font-bold tracking-tight font-heading">
              {config.brand.name}<span className="text-muted-foreground font-light">{config.brand.suffix}</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              link.subLinks ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {link.subLinks.map((sub) => (
                      <DropdownMenuItem key={sub.name} asChild>
                        <Link to={sub.href} className="w-full">{sub.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">Hi, {user.username}</span>
                <Link to="/dashboard"><Button size="sm">Client Area</Button></Link>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </>
            ) : (
              <Link to="/auth"><Button size="sm">Login</Button></Link>
            )}
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden text-foreground">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <div className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((link) => (
                  link.subLinks ? (
                    <div key={link.name} className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground">{link.name}</span>
                      <div className="flex flex-col gap-1 pl-4 border-l border-border">
                        {link.subLinks.map((sub) => (
                          <Link key={sub.name} to={sub.href} className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setMobileMenuOpen(false)}>
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link key={link.name} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground py-1" onClick={() => setMobileMenuOpen(false)}>
                      {link.name}
                    </Link>
                  )
                ))}
                <Separator className="bg-border my-2" />
                {user ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground text-center">Logged in as {user.username}</span>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}><Button className="w-full">Client Area</Button></Link>
                    <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false) }}>Logout</Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}><Button className="w-full">Login</Button></Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <main className="pt-20">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      <footer className="py-16 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden shrink-0">
                  <img src={config.brand.logoUrl} alt={config.brand.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-lg font-bold tracking-tight">{config.brand.name}<span className="text-muted-foreground">{config.brand.suffix}</span></span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{config.brand.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-xs tracking-wider text-foreground uppercase">Services</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/minecraft" className="hover:text-foreground transition-colors">Minecraft Hosting</Link></li>
                <li><Link to="/vps" className="hover:text-foreground transition-colors">VPS Hosting</Link></li>
                <li><Link to="/discord-bot" className="hover:text-foreground transition-colors">Discord Bot Hosting</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-xs tracking-wider text-foreground uppercase">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-xs tracking-wider text-foreground uppercase">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/knowledge-base" className="hover:text-foreground transition-colors">Knowledge Base</Link></li>
                <li><a href={config.contact.discord} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discord Server</a></li>
                <li><Link to="/support" className="hover:text-foreground transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="bg-border mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-xs">
            <div>&copy; 2026 {config.brand.name}{config.brand.suffix}. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a>
              <a href={config.contact.discord} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discord</a>
              <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
