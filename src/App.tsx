import { lazy, Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import AppRouter from '@/app/router'

const FallbackLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-semibold gap-3 select-none">
    <div className="w-5 h-5 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
    <span className="text-xs">Loading page...</span>
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<FallbackLoader />}>
      <AppRouter />
    </Suspense>
  )
}