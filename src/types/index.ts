export type Profile = {
  id: string
  username: string | null
  theme: {
    accentColor: string
    mode: 'light' | 'dark' | 'custom'
  }
  created_at: string
}

export type Habit = {
  id: string
  user_id: string
  name: string
  category: string
  color: string
  days: number[]
  created_at: string
}

export type HabitLog = {
  id: string
  habit_id: string
  completed_at: string
  user_id: string
  created_at: string
}

export type Routine = {
  id: string
  user_id: string
  time: string
  label: string
  duration: number
  color: string
  created_at: string
}
