'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { reviewPoaEvent, reviewHarvestEvent } from '../actions'
import type { AdminPoaEvent, AdminHarvestEvent } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'

export function PoaEventReviewList({ vaultId, events }: { vaultId: string; events: AdminPoaEvent[] }) {
  const [pending, startTransition] = useTransition()

  function act(eventId: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      try {
        await reviewPoaEvent(vaultId, eventId, status)
        toast.success(`Event ${status}`)
      } catch {
        toast.error('Review failed')
      }
    })
  }

  if (events.length === 0) return <p className="text-sm text-muted-foreground">No PoA events.</p>

  return (
    <ul className="divide-y">
      {events.map((e) => (
        <li key={e.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">
              {e.activity} · {e.photoCount} photos
            </p>
            <p className="text-sm text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={e.status} />
            {e.status === 'pending' && (
              <>
                <Button size="sm" disabled={pending} onClick={() => act(e.id, 'approved')}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => act(e.id, 'rejected')}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function HarvestEventReviewList({
  vaultId,
  events,
}: {
  vaultId: string
  events: AdminHarvestEvent[]
}) {
  const [pending, startTransition] = useTransition()

  function act(eventId: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      try {
        await reviewHarvestEvent(vaultId, eventId, status)
        toast.success(`Event ${status}`)
      } catch {
        toast.error('Review failed')
      }
    })
  }

  if (events.length === 0) return <p className="text-sm text-muted-foreground">No harvest events.</p>

  return (
    <ul className="divide-y">
      {events.map((e) => (
        <li key={e.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">
              {e.kg} kg · Grade {e.grade}
            </p>
            <p className="text-sm text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={e.status} />
            {e.status === 'pending' && (
              <>
                <Button size="sm" disabled={pending} onClick={() => act(e.id, 'approved')}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => act(e.id, 'rejected')}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
