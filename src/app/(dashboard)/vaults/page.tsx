import Link from 'next/link'
import { adminFetch } from '@/lib/api'
import type { AdminVault } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty-state'
import { Sprout, Search } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'poa_due', label: 'PoA Due' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export default async function VaultsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  const vaults = await adminFetch<AdminVault[]>(`/admin/vaults?${params.toString()}`)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vaults</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage crop cycles and field operations
          </p>
        </div>
        <Button render={<Link href="/vaults/new" />}>
          <Sprout className="mr-1.5 h-4 w-4" />
          New vault
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
                    href={`/vaults${value ? `?status=${value}` : ''}${q && value ? `&q=${q}` : q && !value ? `?q=${q}` : ''}`}
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
                placeholder="Search code or location..."
                defaultValue={q ?? ''}
                className="pl-8"
              />
            </form>
          </div>
        </CardContent>
      </Card>

      {vaults.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No vaults found"
          description={
            q || status
              ? 'Try adjusting your search or filters.'
              : 'Create your first vault to get started.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Progress</TableHead>
                  <TableHead>Funding</TableHead>
                  <TableHead>Farmers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaults.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <Link
                        href={`/vaults/${v.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {v.code}
                      </Link>
                    </TableCell>
                    <TableCell>{v.cropLabel}</TableCell>
                    <TableCell>{v.location}</TableCell>
                    <TableCell>
                      <StatusBadge status={v.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${v.dayTotal > 0 ? Math.min((v.dayCurrent / v.dayTotal) * 100, 100) : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-16 text-right">
                          {v.dayCurrent}/{v.dayTotal}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      ${v.fundedUsd?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '—'}
                    </TableCell>
                    <TableCell>{v.farmerCount}</TableCell>
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
