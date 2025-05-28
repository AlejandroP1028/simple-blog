import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { useAppSelector } from '@/store'
import { useAppDispatch } from '@/store'
import { Separator } from '@/components/ui/separator'
import { clearUser } from '@/features/userSlice'

interface NavBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function NavBar({ className, ...props }: NavBarProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const router = useRouter()

  return (
    <nav
      className={cn(
        'flex items-center justify-between px-6 py-4 bg-background border-b',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="text-3xl font-bold text-blue-600">
          DevBlog
        </Link>
        <Separator orientation="vertical" className="min-h-full" />
        {user.isLoggedIn && (
          <Link href="/blogs" className="hover:underline">
            Your Blogs
          </Link>
        )}
      </div>

      {user.isLoggedIn ? (
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Welcome, {user.firstName} {user.lastName}!
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const supabase = createClient()
              supabase.auth.signOut().then(() => {
                dispatch(clearUser())
                router.push('/auth/login')
              })
            }}
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            router.push('/auth/login')
          }}
        >
          Sign In
        </Button>
      )}
    </nav>
  )
}

export default NavBar
