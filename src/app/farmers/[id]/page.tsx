import { notFound } from 'next/navigation'
import { adminFetch, ApiError } from '@/lib/api'
import type { AdminFarmer } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { FarmerEditForm } from './farmer-edit-form'

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
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{farmer.farmerCode}</h1>
        <StatusBadge status={farmer.status} />
      </div>
      <FarmerEditForm farmer={farmer} />
    </div>
  )
}
