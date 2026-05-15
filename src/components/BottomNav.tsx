'use client'

import { Home, List, Clock, PieChart } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Tab = 'today' | 'habits' | 'routine' | 'analytics'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'habits', label: 'Habits', icon: List },
    { id: 'routine', label: 'Routine', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] px-4 pb-safe">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors",
              activeTab === id ? "text-[var(--accent)]" : "text-muted-foreground opacity-60 hover:opacity-100"
            )}
          >
            <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 2} />
            <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
