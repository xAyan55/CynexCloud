import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import SearchModal from "./components/SearchModal";

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut loader for global search Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Loading wrapper state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-semibold gap-3 select-none">
        <div className="w-5 h-5 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
        <span className="text-xs">Loading Session...</span>
      </div>
    );
  }

  // Redirect to login if user session is not found
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex relative text-zinc-300 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main Content Layout Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <TopNav 
          setMobileOpen={setMobileOpen} 
          onSearchOpen={() => setSearchOpen(true)} 
        />

        {/* Dynamic Nested Content Views Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <Outlet />
        </main>
      </div>

      {/* Global Cmd+K Search modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </div>
  );
}
