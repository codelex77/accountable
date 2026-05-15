'use client'

import { useProfile } from '@/hooks/useProfile'
import { useEffect, ReactNode } from 'react'

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  const { profile } = useProfile()

  useEffect(() => {
    if (profile?.theme) {
      document.documentElement.setAttribute('data-theme', profile.theme.mode)
      if (profile.theme.accentColor) {
        document.documentElement.style.setProperty('--accent', profile.theme.accentColor)
      }
    }
  }, [profile])

  return <>{children}</>
}
