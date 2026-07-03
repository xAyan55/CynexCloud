import { lazy, Suspense, ComponentType } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

const RouteErrorBoundary = () => {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? error.statusText : error instanceof Error ? error.message : 'Page failed to load'
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-4 p-8">
      <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center">
        <span className="text-xl">!</span>
      </div>
      <p className="text-sm text-center max-w-md">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors"
      >
        Reload page
      </button>
    </div>
  )
}

const RouteLoadError = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-4 p-8">
    <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center">
      <span className="text-xl">!</span>
    </div>
    <p className="text-sm text-center max-w-md">This page could not be loaded.</p>
    <p className="text-xs text-zinc-600 text-center max-w-sm">A new version may have been deployed. Please refresh.</p>
    <button
      onClick={() => window.location.reload()}
      className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors"
    >
      Reload page
    </button>
  </div>
)

function lazyRetry<T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>) {
  return lazy(() => importFn().catch(() => ({ default: RouteLoadError as unknown as T })))
}

const DashboardLayout = lazyRetry(() => import('@/components/layout/DashboardLayout'))
const AppLayout = lazyRetry(() => import('@/components/layout/AppLayout'))
const Login = lazyRetry(() => import('@/pages/auth/Login'))
const Register = lazyRetry(() => import('@/pages/auth/Register'))
const ForgotPassword = lazyRetry(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazyRetry(() => import('@/pages/auth/ResetPassword'))
const VerifyEmail = lazyRetry(() => import('@/pages/auth/VerifyEmail'))

const Home = lazyRetry(() => import('@/pages/public/Home'))
const MinecraftPlans = lazyRetry(() => import('@/pages/public/MinecraftPlans'))
const VPSPlans = lazyRetry(() => import('@/pages/public/VPSPlans'))
const DiscordBotPlans = lazyRetry(() => import('@/pages/public/DiscordBotPlans'))
const SelectCategory = lazyRetry(() => import('@/pages/public/SelectCategory'))
const Features = lazyRetry(() => import('@/pages/public/Features'))
const Support = lazyRetry(() => import('@/pages/public/Support'))
const About = lazyRetry(() => import('@/pages/public/About'))
const Contact = lazyRetry(() => import('@/pages/public/Contact'))
const Terms = lazyRetry(() => import('@/pages/public/Terms'))
const Privacy = lazyRetry(() => import('@/pages/public/Privacy'))
const KnowledgeBase = lazyRetry(() => import('@/pages/public/KnowledgeBase'))
const KnowledgeBaseCategory = lazyRetry(() => import('@/pages/public/KnowledgeBaseCategory'))
const KnowledgeBaseArticle = lazyRetry(() => import('@/pages/public/KnowledgeBaseArticle'))

const DashboardHome = lazyRetry(() => import('@/pages/dashboard/DashboardHome'))
const Services = lazyRetry(() => import('@/pages/dashboard/Services'))
const ServiceDetail = lazyRetry(() => import('@/pages/dashboard/ServiceDetail'))
const Deploy = lazyRetry(() => import('@/pages/dashboard/Deploy'))
const Invoices = lazyRetry(() => import('@/pages/dashboard/Invoices'))
const PaymentHistory = lazyRetry(() => import('@/pages/dashboard/PaymentHistory'))
const Tickets = lazyRetry(() => import('@/pages/dashboard/Tickets'))
const CreateTicket = lazyRetry(() => import('@/pages/dashboard/CreateTicket'))
const TicketDetail = lazyRetry(() => import('@/pages/dashboard/TicketDetail'))
const Announcements = lazyRetry(() => import('@/pages/dashboard/Announcements'))
const Profile = lazyRetry(() => import('@/pages/dashboard/Profile'))
const Security = lazyRetry(() => import('@/pages/dashboard/Security'))
const ApiKeys = lazyRetry(() => import('@/pages/dashboard/ApiKeys'))
const Settings = lazyRetry(() => import('@/pages/dashboard/Settings'))

const PanelConfig = lazyRetry(() => import('@/pages/admin/PanelConfig'))
const AdminPlans = lazyRetry(() => import('@/pages/admin/AdminPlans'))
const AdminTickets = lazyRetry(() => import('@/pages/admin/AdminTickets'))
const AdminTicketDetail = lazyRetry(() => import('@/pages/admin/AdminTicketDetail'))
const AdminUsers = lazyRetry(() => import('@/pages/admin/AdminUsers'))

const Checkout = lazyRetry(() => import('@/pages/Checkout'))

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
      element: <Navigate to="/login" replace />,
    },
    {
      path: '/login',
      errorElement: <RouteErrorBoundary />,
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: '/register',
      errorElement: <RouteErrorBoundary />,
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <Register />
        </Suspense>
      ),
    },
    {
      path: '/forgot-password',
      errorElement: <RouteErrorBoundary />,
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <ForgotPassword />
        </Suspense>
      ),
    },
    {
      path: '/reset-password',
      errorElement: <RouteErrorBoundary />,
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <ResetPassword />
        </Suspense>
      ),
    },
    {
      path: '/verify-email',
      errorElement: <RouteErrorBoundary />,
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <VerifyEmail />
        </Suspense>
      ),
    },

    {
      path: '/dashboard',
      errorElement: <RouteErrorBoundary />,
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
        { path: 'invoices', element: <Invoices /> },
        { path: 'payment-history', element: <PaymentHistory /> },
        { path: 'support', element: <Tickets /> },
        { path: 'support/create', element: <CreateTicket /> },
        { path: 'support/:id', element: <TicketDetail /> },
        { path: 'announcements', element: <Announcements /> },
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
      path: '/',
      errorElement: <RouteErrorBoundary />,
      element: (
        <Suspense fallback={<FallbackLoader />}>
          <AppLayout />
        </Suspense>
      ),
      children: [
        { index: true, element: <Home /> },
        { path: 'minecraft', element: <MinecraftPlans /> },
        { path: 'vps', element: <VPSPlans /> },
        { path: 'discord-bot', element: <DiscordBotPlans /> },
        { path: 'select-category', element: <SelectCategory /> },
        { path: 'features', element: <Features /> },
        { path: 'support', element: <Support /> },
        { path: 'about', element: <About /> },
        { path: 'contact', element: <Contact /> },
        { path: 'terms', element: <Terms /> },
        { path: 'privacy', element: <Privacy /> },
        { path: 'knowledge-base', element: <KnowledgeBase /> },
        { path: 'knowledge-base/:category', element: <KnowledgeBaseCategory /> },
        { path: 'knowledge-base/:category/:article', element: <KnowledgeBaseArticle /> },
        { path: 'checkout/minecraft/:planId', element: <Checkout /> },
      ],
    },
  ])

  return <RouterProvider router={router} />;
}

export { Toaster }
