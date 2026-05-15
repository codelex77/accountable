import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { Habit, HabitLog } from '@/types'
import { startOfDay, format } from 'date-fns'

export function useHabits() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: habits, isLoading: isLoadingHabits } = useQuery({
    queryKey: ['habits'],
    enabled: !!supabase,
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as Habit[]
    }
  })

  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['habit_logs'],
    enabled: !!supabase,
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
      
      if (error) throw error
      return data as HabitLog[]
    }
  })

  const toggleHabit = useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string, date: string, completed: boolean }) => {
      if (!supabase) return
      if (completed) {
        const { error } = await supabase
          .from('habit_logs')
          .insert({ habit_id: habitId, completed_at: date })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_at', date)
        if (error) throw error
      }
    },
    onMutate: async ({ habitId, date, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['habit_logs'] })
      const previousLogs = queryClient.getQueryData(['habit_logs'])
      
      queryClient.setQueryData(['habit_logs'], (old: HabitLog[] | undefined) => {
        if (!old) return []
        if (completed) {
          return [...old, { id: 'temp-' + Date.now(), habit_id: habitId, completed_at: date, user_id: '', created_at: '' }]
        } else {
          return old.filter(l => !(l.habit_id === habitId && l.completed_at === date))
        }
      })
      
      return { previousLogs }
    },
    onError: (err, newLog, context) => {
      queryClient.setQueryData(['habit_logs'], context?.previousLogs)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habit_logs'] })
    }
  })

  const addHabit = useMutation({
    mutationFn: async (newHabit: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => {
      if (!supabase) return null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('habits')
        .insert({ ...newHabit, user_id: user.id })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    }
  })

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    }
  })

  return {
    habits,
    logs,
    isLoading: isLoadingHabits || isLoadingLogs,
    toggleHabit,
    addHabit,
    deleteHabit
  }
}
