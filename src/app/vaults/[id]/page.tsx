import { notFound } from 'next/navigation'
import { adminFetch, ApiError } from '@/lib/api'
import type { AdminVault, AdminPoaEvent, AdminHarvestEvent } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VaultEditForm } from './vault-edit-form'
import { PoaEventReviewList, HarvestEventReviewList } from './event-review-list'

export default async function VaultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let vault: AdminVault
  try {
    vault = await adminFetch<AdminVault>(`/admin/vaults/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }

  const [poaEvents, harvestEvents] = await Promise.all([
    adminFetch<AdminPoaEvent[]>(`/admin/vaults/${id}/poa-events`),
    adminFetch<AdminHarvestEvent[]>(`/admin/vaults/${id}/harvest-events`),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{vault.code}</h1>
        <StatusBadge status={vault.status} />
      </div>

      <VaultEditForm vault={vault} />

      <Tabs defaultValue="poa">
        <TabsList>
          <TabsTrigger value="poa">PoA Events ({poaEvents.length})</TabsTrigger>
          <TabsTrigger value="harvest">Harvest Events ({harvestEvents.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="poa">
          <PoaEventReviewList vaultId={vault.id} events={poaEvents} />
        </TabsContent>
        <TabsContent value="harvest">
          <HarvestEventReviewList vaultId={vault.id} events={harvestEvents} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
