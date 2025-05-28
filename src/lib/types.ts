export type Blog = {
  id: string
  title: string
  excerpt: string
  user_id: string
  content: string
  profiles?: {
    first_name?: string
    last_name?: string
  }
  created_at?: string
}

export interface UserState {
  id: string | null
  email: string | null
  firstName?: string
  lastName?: string
  isLoggedIn: boolean
}
