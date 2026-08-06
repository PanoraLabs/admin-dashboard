'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('panora-sidebar-collapsed')
      return saved === 'true'
    }
    return false
  })

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'panora-sidebar-collapsed' && e.newValue !== null) {
        setSidebarCollapsed(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div className="min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div
        className={sidebarCollapsed ? 'pl-[68px]' : 'pl-[240px]'}
        style={{ transition: 'padding-left 300ms' }}
      >
        <Topbar />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
