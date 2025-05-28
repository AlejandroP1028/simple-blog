// lib/initializeUser.ts
import { createClient } from './supabaseClient'
import { AppDispatch } from '@/store'
import { setUser } from '@/features/userSlice'

export const initializeUser = async (dispatch: AppDispatch) => {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  console.log('HERE', data)

  if (data.user) {
    dispatch(
      setUser({
        id: data.user.id,
        email: data.user.email || null,
        firstName: data.user.user_metadata.first_name || '',
        lastName: data.user.user_metadata.last_name || '',
      })
    )
  }
}
