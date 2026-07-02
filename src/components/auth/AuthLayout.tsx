import { ReactNode } from 'react'
import config from '@/config.json'

interface AuthLayoutProps {
  children: ReactNode
  backgroundImage?: string
}

export default function AuthLayout({ children, backgroundImage }: AuthLayoutProps) {
  const bgImage = backgroundImage || config.images.authImage

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex relative w-[55%] min-h-screen overflow-hidden">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              <img src={config.brand.logoUrl} alt={config.brand.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="text-lg font-bold text-white">{config.brand.name}</span>
          </div>
          <div>
            <p className="text-sm text-zinc-400">v1.0.0</p>
            <p className="text-xs text-zinc-500 mt-1">&copy; 2026 {config.brand.name}. All rights reserved.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  )
}
