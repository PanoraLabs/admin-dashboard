import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminFetch, ApiError } from '@/lib/api'
import type { AdminFarmer } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FarmerEditForm } from './farmer-edit-form'
import { ArrowLeft } from 'lucide-react'

export default async function FarmerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let farmer: AdminFarmer
  try {
    farmer = await adminFetch<AdminFarmer>(`/admin/farmers/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/farmers" />}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to farmers
      </Button>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{farmer.farmerCode}</h1>
          <StatusBadge status={farmer.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {farmer.name} · {farmer.idLine}
          {farmer.vaultLine && <> · {farmer.vaultLine}</>}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit farmer</CardTitle>
        </CardHeader>
        <CardContent>
          <FarmerEditForm farmer={farmer} />
        </CardContent>
      </Card>
    </div>
  )
}
