import Link from 'next/link'
import { adminFetch } from '@/lib/api'
import type { AdminVault } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vaults</h1>
        <Button render={<Link href="/vaults/new" />}>New vault</Button>
      </div>

      <form className="flex gap-2" method="get">
        <Input name="q" placeholder="Search code or location…" defaultValue={q ?? ''} />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Crop</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Farmers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vaults.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <Link href={`/vaults/${v.id}`} className="font-medium hover:underline">
                  {v.code}
                </Link>
              </TableCell>
              <TableCell>{v.cropLabel}</TableCell>
              <TableCell>{v.location}</TableCell>
              <TableCell>
                <StatusBadge status={v.status} />
              </TableCell>
              <TableCell>
                {v.dayCurrent}/{v.dayTotal}
              </TableCell>
              <TableCell>{v.farmerCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
