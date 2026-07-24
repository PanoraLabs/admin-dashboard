'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateVault, archiveVault } from '../actions'
import type { AdminVault } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function VaultEditForm({ vault }: { vault: AdminVault }) {
  const [cropLabel, setCropLabel] = useState(vault.cropLabel)
  const [location, setLocation] = useState(vault.location)
  const [dayCurrent, setDayCurrent] = useState(vault.dayCurrent)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      try {
        await updateVault(vault.id, { cropLabel, location, dayCurrent })
        toast.success('Vault updated')
      } catch {
        toast.error('Update failed')
      }
    })
  }

  function archive() {
    startTransition(async () => {
      await archiveVault(vault.id)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cropLabel">Crop label</Label>
        <Input id="cropLabel" value={cropLabel} onChange={(e) => setCropLabel(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dayCurrent">Day current</Label>
        <Input
          id="dayCurrent"
          type="number"
          min={0}
          value={dayCurrent}
          onChange={(e) => setDayCurrent(Number(e.target.value))}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>
          Save
        </Button>
        {vault.status !== 'archived' && (
          <Button onClick={archive} variant="destructive" disabled={pending}>
            Archive
          </Button>
        )}
      </div>
    </div>
  )
}
