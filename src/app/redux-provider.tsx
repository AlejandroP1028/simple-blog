'use client'

import { Provider, useDispatch } from 'react-redux'
import { store } from '@/store'
import { useEffect } from 'react'
import { initializeUser } from '@/lib/initializeUser'
import NavBar from '@/components/nav-bar'
function InitUserWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()

  useEffect(() => {
    initializeUser(dispatch)
  }, [dispatch])

  return <>{children}</>
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <InitUserWrapper>{children}</InitUserWrapper>
    </Provider>
  )
}
