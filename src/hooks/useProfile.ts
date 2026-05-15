import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types'

export function useProfile() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    enabled: !!supabase,
    queryFn: async () => {
      if (!supabase) return null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const newProfile = {
            id: user.id,
            username: user.email?.split('@')[0] || 'User',
            theme: { accentColor: '#C8B560', mode: 'dark' }
          }
          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()
          if (createError) throw createError
          return created as Profile
        }
        throw error
      }
      return data as Profile
    }
  })

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!supabase) return null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })

  return {
    profile,
    isLoading,
    updateProfile
  }
}
