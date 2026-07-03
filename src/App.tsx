import { Suspense } from 'react'
import AppRouter from '@/app/router'
import FallbackLoader from '@/components/FallbackLoader'

export default function App() {
  return (
    <Suspense fallback={<FallbackLoader />}>
      <AppRouter />
    </Suspense>
  )
}