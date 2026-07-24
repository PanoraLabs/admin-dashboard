import Link from 'next/link'
import { adminFetch } from '@/lib/api'
import type { AdminFarmer } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Farmers</h1>
        <Button render={<Link href="/farmers/new" />}>New farmer</Button>
      </div>

      <form className="flex gap-2" method="get">
        <Input name="q" placeholder="Search name or code…" defaultValue={q ?? ''} />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Vault</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {farmers.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Link href={`/farmers/${f.id}`} className="font-medium hover:underline">
                  {f.farmerCode}
                </Link>
              </TableCell>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.vaultLine}</TableCell>
              <TableCell>
                <StatusBadge status={f.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
