import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { UserState } from '@/lib/types' 

const initialState: UserState = {
  id: null,
  email: null,
  firstName: undefined,
  lastName: undefined,
  isLoggedIn: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<UserState, 'isLoggedIn'>>) => {
      state.id = action.payload.id
      state.email = action.payload.email
      state.firstName = action.payload.firstName
      state.lastName = action.payload.lastName
      state.isLoggedIn = true
    },
    clearUser: (state) => {
      state.id = null
      state.email = null
      state.firstName = undefined
      state.lastName = undefined
      state.isLoggedIn = false
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
