'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sprout, Users, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: (collapsed: boolean) => void
}

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vaults', label: 'Vaults', icon: Sprout },
  { href: '/farmers', label: 'Farmers', icon: Users },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  function toggle() {
    const next = !collapsed
    onToggle(next)
    localStorage.setItem('panora-sidebar-collapsed', String(next))
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      )}
    >
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-sidebar-border">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Sprout className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
            Panora
          </span>
        )}
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-2.5 py-2.5">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
