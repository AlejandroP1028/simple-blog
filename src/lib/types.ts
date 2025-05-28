export type Blog = {
    id: string
    title: string
    excerpt: string
    content: string
  }

  export interface UserState {
    id: string | null
    email: string | null
    firstName?: string
    lastName?: string
    isLoggedIn: boolean
  }
  