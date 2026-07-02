import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MinecraftPlans from "./pages/MinecraftPlans";
import VPSPlans from "./pages/VPSPlans";
import DiscordBotPlans from "./pages/DiscordBotPlans";
import SelectCategory from "./pages/SelectCategory";
import Features from "./pages/Features";
import Support from "./pages/Support";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import KnowledgeBase from "./pages/KnowledgeBase";
import DesignSystem from "./pages/DesignSystem";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./hooks/useAuth";

const Checkout = lazy(() => import("./dashboard/pages/Checkout"));

// Dashboard Lazy Route Imports
const DashboardLayout = lazy(() => import("./dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("./dashboard/pages/DashboardHome"));
const Services = lazy(() => import("./dashboard/pages/Services"));
const ServiceDetail = lazy(() => import("./dashboard/pages/ServiceDetail"));
const Deploy = lazy(() => import("./dashboard/pages/Deploy"));
const Backups = lazy(() => import("./dashboard/pages/Backups"));
const Databases = lazy(() => import("./dashboard/pages/Databases"));
const Schedules = lazy(() => import("./dashboard/pages/Schedules"));
const Subusers = lazy(() => import("./dashboard/pages/Subusers"));
const Invoices = lazy(() => import("./dashboard/pages/Invoices"));
const PaymentHistory = lazy(() => import("./dashboard/pages/PaymentHistory"));
const Tickets = lazy(() => import("./dashboard/pages/Tickets"));
const CreateTicket = lazy(() => import("./dashboard/pages/CreateTicket"));
const TicketDetail = lazy(() => import("./dashboard/pages/TicketDetail"));
const Announcements = lazy(() => import("./dashboard/pages/Announcements"));
const Knowledgebase = lazy(() => import("./dashboard/pages/Knowledgebase"));
const Profile = lazy(() => import("./dashboard/pages/Profile"));
const Security = lazy(() => import("./dashboard/pages/Security"));
const ApiKeys = lazy(() => import("./dashboard/pages/ApiKeys"));
const Settings = lazy(() => import("./dashboard/pages/Settings"));

// Admin pages
const PanelConfig = lazy(() => import("./dashboard/pages/admin/PanelConfig"));
const AdminPlans = lazy(() => import("./dashboard/pages/admin/AdminPlans"));
const AdminTickets = lazy(() => import("./dashboard/pages/admin/AdminTickets"));
const AdminTicketDetail = lazy(() => import("./dashboard/pages/admin/AdminTicketDetail"));
const AdminUsers = lazy(() => import("./dashboard/pages/admin/AdminUsers"));

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-semibold gap-3 select-none">
            <div className="w-5 h-5 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
            <span className="text-xs">Loading page...</span>
          </div>
        }>
          <Routes>
            {/* Full Screen Auth Pages */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/verify-email" element={<Auth />} />
            <Route path="/forgot-password" element={<Auth />} />
            <Route path="/reset-password" element={<Auth />} />

            {/* Dashboard Workspace Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="services" element={<Services />} />
              <Route path="services/:id" element={<ServiceDetail />} />
              <Route path="deploy" element={<Deploy />} />
              <Route path="backups" element={<Backups />} />
              <Route path="databases" element={<Databases />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="subusers" element={<Subusers />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="payment-history" element={<PaymentHistory />} />
              <Route path="support" element={<Tickets />} />
              <Route path="support/create" element={<CreateTicket />} />
              <Route path="support/:id" element={<TicketDetail />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="knowledge-base" element={<Knowledgebase />} />
              <Route path="profile" element={<Profile />} />
              <Route path="security" element={<Security />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="settings" element={<Settings />} />
              
              <Route path="admin/config" element={<RequireAdmin><PanelConfig /></RequireAdmin>} />
              <Route path="admin/plans" element={<RequireAdmin><AdminPlans /></RequireAdmin>} />
              <Route path="admin/tickets" element={<RequireAdmin><AdminTickets /></RequireAdmin>} />
              <Route path="admin/tickets/:id" element={<RequireAdmin><AdminTicketDetail /></RequireAdmin>} />
              <Route path="admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
            </Route>

            {/* Site Core Pages (With Header/Footer Layout) */}
            <Route path="*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/minecraft" element={<MinecraftPlans />} />
                  <Route path="/vps" element={<VPSPlans />} />
                  <Route path="/discord-bot" element={<DiscordBotPlans />} />
                  <Route path="/select-category" element={<SelectCategory />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/design-system" element={<DesignSystem />} />
                  <Route path="/checkout/minecraft/:planId" element={<Checkout />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
