import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Server, Gamepad2, FileText, HelpCircle, X } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard keys (Esc, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          handleSelect(filteredItems[activeIndex].path);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, query, activeIndex]);

  const searchItems = [
    { label: "Overview Dashboard", category: "Navigation", path: "/dashboard", icon: Server },
    { label: "My Servers List", category: "Services", path: "/dashboard/servers", icon: Gamepad2 },
    { label: "Deploy a New Server", category: "Services", path: "/dashboard/deploy", icon: Gamepad2 },
    { label: "Manage Backups", category: "Management", path: "/dashboard/backups", icon: FileText },
    { label: "Manage Databases", category: "Management", path: "/dashboard/databases", icon: FileText },
    { label: "Manage Schedules", category: "Management", path: "/dashboard/schedules", icon: FileText },
    { label: "Billing Invoices", category: "Account", path: "/dashboard/invoices", icon: FileText },
    { label: "Support Center", category: "Account", path: "/dashboard/support", icon: HelpCircle },
    { label: "Announcements Panel", category: "Account", path: "/dashboard/announcements", icon: HelpCircle },
    { label: "Knowledgebase Docs", category: "Account", path: "/dashboard/knowledge-base", icon: HelpCircle },
    { label: "My User Profile", category: "Settings", path: "/dashboard/profile", icon: FileText },
    { label: "Security & Sessions", category: "Settings", path: "/dashboard/security", icon: FileText },
    { label: "API Keys Manager", category: "Settings", path: "/dashboard/api-keys", icon: FileText },
    { label: "Dashboard Settings", category: "Settings", path: "/dashboard/settings", icon: FileText },
  ];

  const filteredItems = searchItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-28 px-4">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Search Input Dialog Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden relative z-10">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages and actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="w-full bg-transparent text-white placeholder-zinc-500 border-none outline-none focus:ring-0 text-base h-9"
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const active = index === activeIndex;
              const Icon = item.icon;

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(item.path)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all cursor-pointer ${
                    active ? "bg-white/[0.04] text-white" : "text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
                    <div>
                      <span className="text-sm font-medium block">{item.label}</span>
                      <span className="text-[10px] font-medium text-zinc-600">{item.category}</span>
                    </div>
                  </div>
                  {active && (
                    <span className="text-[10px] text-zinc-500 font-medium bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                      Enter
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 text-zinc-500">
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-zinc-600 mt-1">Try searching for "Servers", "Invoices", or "API".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
