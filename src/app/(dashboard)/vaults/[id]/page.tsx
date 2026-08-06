import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminFetch, ApiError } from '@/lib/api'
import type { AdminVault, AdminPoaEvent, AdminHarvestEvent } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VaultEditForm } from './vault-edit-form'
import { PoaEventReviewList, HarvestEventReviewList } from './event-review-list'
import { ArrowLeft } from 'lucide-react'

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
    adminFetch<AdminPoaEvent[]>(`/admin/vaults/${id}/poa-events`).catch(() => [] as AdminPoaEvent[]),
    adminFetch<AdminHarvestEvent[]>(`/admin/vaults/${id}/harvest-events`).catch(() => [] as AdminHarvestEvent[]),
  ])

  const pendingPoas = poaEvents.filter((e) => e.status === 'pending').length
  const pendingHarvests = harvestEvents.filter((e) => e.status === 'pending').length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/vaults" />}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to vaults
      </Button>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{vault.code}</h1>
          <StatusBadge status={vault.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {vault.cropLabel} · {vault.location} · Day {vault.dayCurrent}/{vault.dayTotal}
          {vault.fundedUsd != null && (
            <> · ${vault.fundedUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} funded</>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit vault</CardTitle>
        </CardHeader>
        <CardContent>
          <VaultEditForm vault={vault} />
        </CardContent>
      </Card>

      <Tabs defaultValue="poa">
        <TabsList>
          <TabsTrigger value="poa">
            PoA Events
            {pendingPoas > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-100 px-1.5 py-0 text-[10px] font-semibold text-amber-800 min-w-5">
                {pendingPoas}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="harvest">
            Harvest Events
            {pendingHarvests > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-100 px-1.5 py-0 text-[10px] font-semibold text-amber-800 min-w-5">
                {pendingHarvests}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="poa" className="mt-0">
          <Card className="rounded-tl-none">
            <CardContent className="pt-6">
              <PoaEventReviewList vaultId={vault.id} events={poaEvents} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="harvest" className="mt-0">
          <Card className="rounded-tl-none">
            <CardContent className="pt-6">
              <HarvestEventReviewList vaultId={vault.id} events={harvestEvents} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
