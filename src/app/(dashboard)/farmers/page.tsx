import Link from 'next/link'
import { adminFetch } from '@/lib/api'
import type { AdminFarmer } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty-state'
import { Users, Search } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'new', label: 'New' },
  { value: 'archived', label: 'Archived' },
]

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  const farmers = await adminFetch<AdminFarmer[]>(`/admin/farmers?${params.toString()}`)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Farmers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage registered farmers and their vault assignments
          </p>
        </div>
        <Button render={<Link href="/farmers/new" />}>
          <Users className="mr-1.5 h-4 w-4" />
          New farmer
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map(({ value, label }) => {
                const active = (status ?? '') === value
                return (
                  <Link
                    key={value}
                    href={`/farmers${value ? `?status=${value}` : ''}${q && value ? `&q=${q}` : q && !value ? `?q=${q}` : ''}`}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

            <form className="relative w-full sm:w-64" method="get">
              {status && <input type="hidden" name="status" value={status} />}
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search name or code..."
                defaultValue={q ?? ''}
                className="pl-8"
              />
            </form>
          </div>
        </CardContent>
      </Card>

      {farmers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No farmers found"
          description={
            q || status
              ? 'Try adjusting your search or filters.'
              : 'Register your first farmer to get started.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>ID Line</TableHead>
                  <TableHead>Vault</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmers.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <Link
                        href={`/farmers/${f.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {f.farmerCode}
                      </Link>
                    </TableCell>
                    <TableCell>{f.name}</TableCell>
                    <TableCell className="text-muted-foreground">{f.idLine}</TableCell>
                    <TableCell>{f.vaultLine || '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={f.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
