import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'))
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'))

// Public pages
const Home = lazy(() => import('@/pages/public/Home'))
const MinecraftPlans = lazy(() => import('@/pages/public/MinecraftPlans'))
const VPSPlans = lazy(() => import('@/pages/public/VPSPlans'))
const DiscordBotPlans = lazy(() => import('@/pages/public/DiscordBotPlans'))
const SelectCategory = lazy(() => import('@/pages/public/SelectCategory'))
const Features = lazy(() => import('@/pages/public/Features'))
const Support = lazy(() => import('@/pages/public/Support'))
const About = lazy(() => import('@/pages/public/About'))
const Contact = lazy(() => import('@/pages/public/Contact'))
const Terms = lazy(() => import('@/pages/public/Terms'))
const Privacy = lazy(() => import('@/pages/public/Privacy'))
const KnowledgeBase = lazy(() => import('@/pages/public/KnowledgeBase'))

// Dashboard pages
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'))
const Services = lazy(() => import('@/pages/dashboard/Services'))
const ServiceDetail = lazy(() => import('@/pages/dashboard/ServiceDetail'))
const Deploy = lazy(() => import('@/pages/dashboard/Deploy'))
const Backups = lazy(() => import('@/pages/dashboard/Backups'))
const Databases = lazy(() => import('@/pages/dashboard/Databases'))
const Schedules = lazy(() => import('@/pages/dashboard/Schedules'))
const Subusers = lazy(() => import('@/pages/dashboard/Subusers'))
const Invoices = lazy(() => import('@/pages/dashboard/Invoices'))
const PaymentHistory = lazy(() => import('@/pages/dashboard/PaymentHistory'))
const Tickets = lazy(() => import('@/pages/dashboard/Tickets'))
const CreateTicket = lazy(() => import('@/pages/dashboard/CreateTicket'))
const TicketDetail = lazy(() => import('@/pages/dashboard/TicketDetail'))
const Announcements = lazy(() => import('@/pages/dashboard/Announcements'))
const Knowledgebase = lazy(() => import('@/pages/dashboard/Knowledgebase'))
const Profile = lazy(() => import('@/pages/dashboard/Profile'))
const Security = lazy(() => import('@/pages/dashboard/Security'))
const ApiKeys = lazy(() => import('@/pages/dashboard/ApiKeys'))
const Settings = lazy(() => import('@/pages/dashboard/Settings'))

// Admin pages
const PanelConfig = lazy(() => import('@/pages/admin/PanelConfig'))
const AdminPlans = lazy(() => import('@/pages/admin/AdminPlans'))
const AdminTickets = lazy(() => import('@/pages/admin/AdminTickets'))
const AdminTicketDetail = lazy(() => import('@/pages/admin/AdminTicketDetail'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))

// Checkout
const Checkout = lazy(() => import('@/pages/Checkout'))

const FallbackLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-semibold gap-3 select-none">
    <div className="w-5 h-5 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
    <span className="text-xs">Loading page...</span>
  </div>
)

export default function AppRouter() {
  const router = createBrowserRouter([
    {
      path: '/auth',
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <AuthPage />
        </Suspense>
      ),
    },
    {
      path: '/login',
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <AuthPage />
        </Suspense>
      ),
    },
    {
      path: '/register',
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <AuthPage />
        </Suspense>
      ),
    },
    {
      path: '/verify-email',
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <AuthPage />
        </Suspense>
      ),
    },
    {
      path: '/forgot-password',
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <AuthPage />
        </Suspense>
      ),
    },
    {
      path: '/reset-password',
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <AuthPage />
        </Suspense>
      ),
    },

    {
      path: '/dashboard',
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <DashboardLayout />
        </Suspense>
      ),
      children: [
        { index: true, element: <DashboardHome /> },
        { path: 'services', element: <Services /> },
        { path: 'services/:id', element: <ServiceDetail /> },
        { path: 'deploy', element: <Deploy /> },
        { path: 'backups', element: <Backups /> },
        { path: 'databases', element: <Databases /> },
        { path: 'schedules', element: <Schedules /> },
        { path: 'subusers', element: <Subusers /> },
        { path: 'invoices', element: <Invoices /> },
        { path: 'payment-history', element: <PaymentHistory /> },
        { path: 'support', element: <Tickets /> },
        { path: 'support/create', element: <CreateTicket /> },
        { path: 'support/:id', element: <TicketDetail /> },
        { path: 'announcements', element: <Announcements /> },
        { path: 'knowledge-base', element: <Knowledgebase /> },
        { path: 'profile', element: <Profile /> },
        { path: 'security', element: <Security /> },
        { path: 'api-keys', element: <ApiKeys /> },
        { path: 'settings', element: <Settings /> },
        { path: 'admin/config', element: <PanelConfig /> },
        { path: 'admin/plans', element: <AdminPlans /> },
        { path: 'admin/tickets', element: <AdminTickets /> },
        { path: 'admin/tickets/:id', element: <AdminTicketDetail /> },
        { path: 'admin/users', element: <AdminUsers /> },
      ],
    },

    {
      path: '*',
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <AppLayout />
        </Suspense>
      ),
      children: [
        { path: '/', element: <Home /> },
        { path: '/minecraft', element: <MinecraftPlans /> },
        { path: '/vps', element: <VPSPlans /> },
        { path: '/discord-bot', element: <DiscordBotPlans /> },
        { path: '/select-category', element: <SelectCategory /> },
        { path: '/features', element: <Features /> },
        { path: '/support', element: <Support /> },
        { path: '/about', element: <About /> },
        { path: '/contact', element: <Contact /> },
        { path: '/terms', element: <Terms /> },
        { path: '/privacy', element: <Privacy /> },
        { path: '/knowledge-base', element: <KnowledgeBase /> },
        { path: '/checkout/minecraft/:planId', element: <Checkout /> },
      ],
    },
  ])

  return <RouterProvider router={router} />;
}

export { Toaster }