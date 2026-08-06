'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clearTokenAction } from '@/lib/logout'

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function Topbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  async function handleLogout() {
    await clearTokenAction()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 lg:px-6">
      <div />
      <div className="flex items-center gap-2">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
