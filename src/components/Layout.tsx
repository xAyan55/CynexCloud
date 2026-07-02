import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cloud,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NAV_LINKS } from "../constants";
import config from "../config.json";
import { useAuth } from "../hooks/useAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 300);
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = config.seo.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", config.seo.description);
    }
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (favicon && config.seo.faviconUrl) {
      favicon.href = config.seo.faviconUrl;
    }
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "#") return false;
    if (href.startsWith("/#") || href.startsWith("#")) {
      const hash = href.substring(href.indexOf("#"));
      return location.hash === hash;
    }
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white selection:text-black">
      <div 
        className="fixed top-0 left-0 h-[2px] bg-zinc-600 z-[60] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled ? "bg-black/60 backdrop-blur-xl border-white/5 py-3" : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              {config.brand.logoUrl ? (
                <img src={config.brand.logoUrl} alt={config.brand.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Cloud className="w-5 h-5 text-black" />
              )}
            </div>
            <span className="text-lg font-bold tracking-tight font-heading">
              {config.brand.name}
              <span className="text-zinc-500 font-light">{config.brand.suffix}</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <div key={link.name} className="relative" ref={link.subLinks ? dropdownRef : null}>
                {link.subLinks ? (
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                      activeDropdown === link.name || link.subLinks.some(s => isActive(s.href)) ? "text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {link.name}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link 
                    to={link.href} 
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.href) ? "text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                )}

                <AnimatePresence>
                  {link.subLinks && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-3 w-52 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 shadow-xl z-50"
                    >
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.name}
                          to={subLink.href}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            isActive(subLink.href) ? "text-white bg-zinc-800" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                          }`}
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400">Hi, {user.username}</span>
                <Link to="/dashboard">
                  <Button size="sm">Client Area</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>

          <button 
            className="md:hidden text-zinc-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-zinc-900 border-b border-zinc-800 overflow-hidden md:hidden"
            >
              <div className="p-5 flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <div key={link.name} className="flex flex-col gap-1">
                    {link.subLinks ? (
                      <>
                        <button
                          onClick={() => setMobileDropdownOpen(mobileDropdownOpen === link.name ? null : link.name)}
                          className="flex items-center justify-between text-sm font-medium text-zinc-400 py-2.5 w-full text-left"
                        >
                          {link.name}
                          <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdownOpen === link.name ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {mobileDropdownOpen === link.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex flex-col gap-1 pl-4 border-l border-zinc-800 mt-1 mb-1"
                            >
                              {link.subLinks.map((subLink) => (
                                <Link
                                  key={subLink.name}
                                  to={subLink.href}
                                  className="text-sm text-zinc-500 hover:text-white py-2 block"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subLink.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link 
                        to={link.href} 
                        className="text-sm font-medium text-zinc-400 py-2.5 block"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
                <Separator className="bg-zinc-800 my-2" />
                <div className="flex flex-col gap-3">
                  {user ? (
                    <div className="flex flex-col gap-2 w-full">
                      <span className="text-xs text-zinc-500 text-center">Logged in as {user.username}</span>
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Client Area</Button>
                      </Link>
                      <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</Button>
                    </div>
                  ) : (
                    <Link to="/auth" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Login</Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-16 bg-zinc-950 border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center overflow-hidden shrink-0">
                  {config.brand.logoUrl ? (
                    <img src={config.brand.logoUrl} alt={config.brand.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Cloud className="w-4 h-4 text-black" />
                  )}
                </div>
                <span className="text-lg font-bold tracking-tight">{config.brand.name}<span className="text-zinc-500">{config.brand.suffix}</span></span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {config.brand.description}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-5 text-xs tracking-wider text-zinc-300 uppercase">Services</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link to="/minecraft" className="hover:text-white transition-colors">Minecraft Hosting</Link></li>
                <li><Link to="/vps" className="hover:text-white transition-colors">VPS Hosting</Link></li>
                <li><Link to="/discord-bot" className="hover:text-white transition-colors">Discord Bot Hosting</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Dedicated Servers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-xs tracking-wider text-zinc-300 uppercase">Company</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/design-system" className="hover:text-white transition-colors">Design System</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-xs tracking-wider text-zinc-300 uppercase">Support</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link to="/knowledge-base" className="hover:text-white transition-colors">Knowledge Base</Link></li>
                <li><a href={config.contact.discord} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord Server</a></li>
                <li><a href="https://billing.cynexcloud.eu.cc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Billing Area</a></li>
                <li><Link to="/support" className="hover:text-white transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-zinc-900 mb-6" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-600 text-xs">
            <div>© 2026 {config.brand.name}{config.brand.suffix}. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
              <a href={config.contact.discord} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
              <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-200"
            aria-label="Back to top"
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray="107"
                strokeDashoffset={107 - (107 * scrollProgress) / 100}
                className="text-white group-hover:text-black transition-all"
              />
            </svg>
            <ArrowUp className="w-4 h-4 relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
