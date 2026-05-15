import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { Routine } from '@/types'

export function useRoutines() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: routines, isLoading } = useQuery({
    queryKey: ['routines'],
    enabled: !!supabase,
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .order('time', { ascending: true })
      
      if (error) throw error
      return data as Routine[]
    }
  })

  const addRoutine = useMutation({
    mutationFn: async (newRoutine: Omit<Routine, 'id' | 'user_id' | 'created_at'>) => {
      if (!supabase) return null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('routines')
        .insert({ ...newRoutine, user_id: user.id })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
    }
  })

  const deleteRoutine = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
    }
  })

  return {
    routines,
    isLoading,
    addRoutine,
    deleteRoutine
  }
}
