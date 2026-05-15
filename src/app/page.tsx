'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useHabits } from '@/hooks/useHabits'
import { useRoutines } from '@/hooks/useRoutines'
import { useProfile } from '@/hooks/useProfile'
import BottomNav from '@/components/BottomNav'
import { Plus, Check, X, Flame } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CATEGORY_ICONS: Record<string, string> = { Health: "🏃", Mind: "📚", Work: "💼", Social: "🤝", Finance: "💰", Creative: "🎨" }
const HABIT_COLORS = ["#C8B560", "#7EC8A4", "#E07B6A", "#7AA3D4", "#C47EC8", "#E0A96A"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'today' | 'habits' | 'routine' | 'analytics'>('today')
  const { habits, logs, isLoading, toggleHabit, addHabit, deleteHabit } = useHabits()
  const { routines, isLoading: isLoadingRoutines, addRoutine, deleteRoutine } = useRoutines()
  const { profile, updateProfile } = useProfile()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Modal states
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [showAddBlock, setShowAddBlock] = useState(false)

  // New item states
  const [newHabit, setNewHabit] = useState({ name: "", category: "Health", color: "#C8B560", days: [1, 2, 3, 4, 5] })
  const [newBlock, setNewBlock] = useState({ time: "09:00", label: "", duration: 30, color: "#C8B560" })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayDow = new Date().getDay()

  const todayHabits = habits?.filter(h => h.days.includes(todayDow)) || []
  const completedLogs = logs?.filter(l => l.completed_at === today) || []
  const completedTodayIds = new Set(completedLogs.map(l => l.habit_id))
  
  const progress = todayHabits.length > 0 
    ? Math.round((todayHabits.filter(h => completedTodayIds.has(h.id)).length / todayHabits.length) * 100)
    : 0

  const calculateStreak = (habitId: string) => {
    if (!logs) return 0
    const habitLogs = logs
      .filter(l => l.habit_id === habitId)
      .map(l => l.completed_at)
      .sort((a, b) => b.localeCompare(a))
    
    let streak = 0
    let current = new Date()
    // Simple streak calculation logic could be improved but for now:
    return habitLogs.length 
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="p-6 pb-0 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">Accountable</span>
            </div>
            <h1 className="text-3xl font-normal leading-tight">{format(currentTime, 'MMMM d, EEEE')}</h1>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-[var(--accent)]">{format(currentTime, 'h:mm a')}</div>
            <div className="text-[10px] font-mono opacity-40 uppercase tracking-wider">
              {completedTodayIds.size}/{todayHabits.length} habits done
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-px bg-[var(--border)] w-full mt-4">
          <div 
            className="absolute h-px bg-[var(--accent)] transition-all duration-700 ease-in-out"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute right-0 -top-5 text-[10px] font-mono text-[var(--accent)]">
            {progress}%
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto mt-6">
        {activeTab === 'today' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {todayHabits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <span className="text-4xl mb-4">🌙</span>
                <p className="font-mono text-xs uppercase tracking-widest">No habits scheduled today</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-6 py-2 text-[10px] font-mono uppercase tracking-widest opacity-40 border-b border-[var(--border)]">Today's Habits</div>
                {todayHabits.map(habit => {
                  const done = completedTodayIds.has(habit.id)
                  return (
                    <div 
                      key={habit.id}
                      onClick={() => toggleHabit.mutate({ habitId: habit.id, date: today, completed: !done })}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--card)] transition-colors cursor-pointer border-b border-[var(--border)]/50"
                    >
                      <div 
                        className={cn(
                          "w-7 h-7 rounded-full border flex items-center justify-center transition-all",
                          done ? "border-transparent" : "border-[var(--border)] bg-transparent"
                        )}
                        style={{ backgroundColor: done ? habit.color : 'transparent' }}
                      >
                        {done && <Check size={14} className="text-[var(--background)]" />}
                      </div>
                      <div className="flex-1">
                        <div className={cn("text-sm transition-all", done && "opacity-40 line-through")}>
                          {habit.name}
                        </div>
                        <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest mt-1">
                          {CATEGORY_ICONS[habit.category]} {habit.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-[var(--accent)]/10 rounded-full">
                        <Flame size={10} className="text-[var(--accent)]" />
                        <span className="text-[10px] font-mono text-[var(--accent)]">{calculateStreak(habit.id)}d</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quick Routine Preview */}
            {routines && routines.length > 0 && (
              <div className="mt-8 space-y-1">
                <div className="px-6 py-2 text-[10px] font-mono uppercase tracking-widest opacity-40 border-b border-[var(--border)]">Schedule</div>
                <div className="px-6 py-4 space-y-4">
                  {routines.slice(0, 4).map(block => (
                    <div key={block.id} className="flex gap-4 border-l-2 pl-4" style={{ borderColor: block.color }}>
                      <div className="text-[11px] font-mono opacity-50 w-16">{block.time}</div>
                      <div>
                        <div className="text-sm">{block.label}</div>
                        <div className="text-[10px] font-mono opacity-40 mt-0.5">{block.duration} min</div>
                      </div>
                    </div>
                  ))}
                  {routines.length > 4 && (
                    <button 
                      onClick={() => setActiveTab('routine')}
                      className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] mt-2"
                    >
                      +{routines.length - 4} more blocks →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'habits' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="px-6 py-2 flex justify-between items-center border-b border-[var(--border)]">
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">All Habits ({habits?.length || 0})</span>
              <button 
                onClick={() => setShowAddHabit(true)}
                className="bg-[var(--accent)] text-[var(--background)] p-1 rounded-sm hover:opacity-80 transition-opacity"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="divide-y divide-[var(--border)]/50">
              {habits?.map(habit => (
                <div key={habit.id} className="px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                      <span className="text-sm font-medium">{habit.name}</span>
                      <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{CATEGORY_ICONS[habit.category]} {habit.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 px-2 py-1 bg-[var(--accent)]/10 rounded-full">
                        <Flame size={10} className="text-[var(--accent)]" />
                        <span className="text-[10px] font-mono text-[var(--accent)]">{calculateStreak(habit.id)}d</span>
                      </div>
                      <button 
                        onClick={() => deleteHabit.mutate(habit.id)}
                        className="text-muted-foreground opacity-30 hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {DAYS.map((day, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "w-8 h-8 rounded-full border text-[10px] font-mono flex items-center justify-center transition-colors",
                          habit.days.includes(i) 
                            ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" 
                            : "border-[var(--border)] text-muted-foreground opacity-30"
                        )}
                        style={{ 
                          borderColor: habit.days.includes(i) ? habit.color : '',
                          color: habit.days.includes(i) ? habit.color : '',
                          backgroundColor: habit.days.includes(i) ? `${habit.color}10` : ''
                        }}
                      >
                        {day[0]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'routine' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="px-6 py-2 flex justify-between items-center border-b border-[var(--border)]">
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Daily Timetable</span>
              <button 
                onClick={() => setShowAddBlock(true)}
                className="bg-[var(--accent)] text-[var(--background)] p-1 rounded-sm hover:opacity-80 transition-opacity"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-2">
              {routines?.map((block, idx) => (
                <div key={block.id} className="flex gap-4">
                  <div className="flex flex-col items-center w-4">
                    <div className="w-2 h-2 rounded-full mt-5" style={{ backgroundColor: block.color }} />
                    {idx < (routines.length - 1) && <div className="w-px flex-1 bg-[var(--border)] my-1" />}
                  </div>
                  <div 
                    className="flex-1 flex items-center justify-between p-4 bg-[var(--card)] border-l-2 mb-2"
                    style={{ borderLeftColor: block.color }}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="text-[11px] font-mono opacity-50 w-16">{block.time}</div>
                      <div>
                        <div className="text-sm">{block.label}</div>
                        <div className="text-[10px] font-mono opacity-40 mt-0.5">{block.duration} min</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteRoutine.mutate(block.id)}
                      className="text-muted-foreground opacity-20 hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-6 space-y-8">
            <div>
              <h2 className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-4">Consistency</h2>
              <div className="grid grid-cols-7 gap-1">
                {/* Simplified Heatmap Mockup */}
                {Array.from({ length: 28 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "aspect-square rounded-sm",
                      i % 3 === 0 ? "bg-[var(--accent)]" : 
                      i % 4 === 0 ? "bg-[var(--accent)]/60" :
                      i % 2 === 0 ? "bg-[var(--accent)]/20" : "bg-[var(--border)]/20"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="bg-[var(--card)] p-6 border border-[var(--border)] rounded-sm space-y-4">
              <h3 className="text-sm">Weekly Progress</h3>
              <div className="flex items-end justify-between h-32 pt-4">
                {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 w-full">
                    <div 
                      className="w-2 bg-[var(--accent)] rounded-t-full transition-all duration-1000"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[9px] font-mono opacity-40">{DAYS[i][0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--card)] p-6 border border-[var(--border)] rounded-sm space-y-6">
              <h2 className="text-[10px] font-mono uppercase tracking-widest opacity-40">Theme Settings</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(['dark', 'light'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateProfile.mutate({ 
                        theme: { ...profile!.theme, mode } 
                      })}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-mono uppercase tracking-widest border transition-colors",
                        profile?.theme?.mode === mode ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] opacity-60"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-40">Accent Color</div>
                  <div className="flex flex-wrap gap-3">
                    {HABIT_COLORS.map(c => (
                      <button 
                        key={c}
                        onClick={() => updateProfile.mutate({ 
                          theme: { ...profile!.theme, accentColor: c } 
                        })}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-transform",
                          profile?.theme?.accentColor === c ? "scale-110 border-white" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-normal">New Habit</h2>
            <div className="space-y-4">
              <input 
                className="w-full p-2 bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--accent)] text-sm"
                placeholder="Habit name..."
                value={newHabit.name}
                onChange={e => setNewHabit({...newHabit, name: e.target.value})}
              />
              <select 
                className="w-full p-2 bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--accent)] text-sm appearance-none"
                value={newHabit.category}
                onChange={e => setNewHabit({...newHabit, category: e.target.value})}
              >
                {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
              
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest opacity-40">Color</div>
                <div className="flex gap-2">
                  {HABIT_COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={() => setNewHabit({...newHabit, color: c})}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform",
                        newHabit.color === c ? "scale-110 border-white" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest opacity-40">Repeat On</div>
                <div className="flex gap-1.5">
                  {DAYS.map((d, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        const days = newHabit.days.includes(i) 
                          ? newHabit.days.filter(x => x !== i)
                          : [...newHabit.days, i]
                        setNewHabit({...newHabit, days})
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border text-[10px] font-mono transition-colors",
                        newHabit.days.includes(i) ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] opacity-40"
                      )}
                    >
                      {d[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowAddHabit(false)}
                className="flex-1 py-2 text-xs font-mono uppercase tracking-widest border border-[var(--border)] hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  addHabit.mutate(newHabit)
                  setShowAddHabit(false)
                }}
                className="flex-1 py-2 text-xs font-mono uppercase tracking-widest bg-[var(--accent)] text-[var(--background)] hover:opacity-90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-normal">Add Time Block</h2>
            <div className="space-y-4">
              <input 
                className="w-full p-2 bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--accent)] text-sm"
                placeholder="Block label..."
                value={newBlock.label}
                onChange={e => setNewBlock({...newBlock, label: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="time"
                  className="w-full p-2 bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--accent)] text-sm"
                  value={newBlock.time}
                  onChange={e => setNewBlock({...newBlock, time: e.target.value})}
                />
                <div className="relative">
                  <input 
                    type="number"
                    className="w-full p-2 bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--accent)] text-sm"
                    placeholder="Min"
                    value={newBlock.duration}
                    onChange={e => setNewBlock({...newBlock, duration: Number(e.target.value)})}
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-mono opacity-40">MIN</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest opacity-40">Color</div>
                <div className="flex gap-2">
                  {HABIT_COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={() => setNewBlock({...newBlock, color: c})}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform",
                        newBlock.color === c ? "scale-110 border-white" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowAddBlock(false)}
                className="flex-1 py-2 text-xs font-mono uppercase tracking-widest border border-[var(--border)] hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  addRoutine.mutate(newBlock)
                  setShowAddBlock(false)
                }}
                className="flex-1 py-2 text-xs font-mono uppercase tracking-widest bg-[var(--accent)] text-[var(--background)] hover:opacity-90"
              >
                Add Block
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
