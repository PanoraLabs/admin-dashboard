import { adminFetch } from '@/lib/api'
import type { AdminVault, AdminFarmer } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sprout, Users, CircleCheck, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  vaults: AdminVault[]
  farmers: AdminFarmer[]
}

export default async function DashboardPage() {
  let data: DashboardData

  try {
    const [vaults, farmers] = await Promise.all([
      adminFetch<AdminVault[]>('/admin/vaults'),
      adminFetch<AdminFarmer[]>('/admin/farmers'),
    ])
    data = { vaults, farmers }
  } catch {
    data = { vaults: [], farmers: [] }
  }

  const activeVaults = data.vaults.filter((v) => v.status === 'active')
  const poaDueVaults = data.vaults.filter((v) => v.status === 'poa_due')
  const verifiedFarmers = data.farmers.filter((f) => f.status === 'verified')
  const totalFunded = data.vaults.reduce((sum, v) => sum + (v.fundedUsd ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of field operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Vaults
            </CardTitle>
            <Sprout className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeVaults.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PoA Due
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{poaDueVaults.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified Farmers
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{verifiedFarmers.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Funded
            </CardTitle>
            <CircleCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${totalFunded.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Vaults</CardTitle>
          </CardHeader>
          <CardContent>
            {data.vaults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vaults yet.</p>
            ) : (
              <div className="space-y-3">
                {data.vaults.slice(0, 5).map((v) => (
                  <Link
                    key={v.id}
                    href={`/vaults/${v.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{v.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.cropLabel} · {v.location}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : v.status === 'poa_due'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/vaults/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <Sprout className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">New Vault</p>
                <p className="text-xs text-muted-foreground">Create a new crop cycle</p>
              </div>
            </Link>
            <Link
              href="/farmers/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">New Farmer</p>
                <p className="text-xs text-muted-foreground">Register a new farmer</p>
              </div>
            </Link>
            <Link
              href="/vaults"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium">Review Events</p>
                <p className="text-xs text-muted-foreground">Approve pending PoA and harvest events</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
