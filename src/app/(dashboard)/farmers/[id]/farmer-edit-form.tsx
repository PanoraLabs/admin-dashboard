'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateFarmer, archiveFarmer } from '../actions'
import type { AdminFarmer } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FarmerEditForm({ farmer }: { farmer: AdminFarmer }) {
  const [name, setName] = useState(farmer.name)
  const [idLine, setIdLine] = useState(farmer.idLine)
  const [vaultLine, setVaultLine] = useState(farmer.vaultLine)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      try {
        await updateFarmer(farmer.id, { name, idLine, vaultLine })
        toast.success('Farmer updated')
      } catch {
        toast.error('Update failed')
      }
    })
  }

  function archive() {
    startTransition(async () => {
      await archiveFarmer(farmer.id)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="idLine">ID line</Label>
        <Input id="idLine" value={idLine} onChange={(e) => setIdLine(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vaultLine">Vault line</Label>
        <Input id="vaultLine" value={vaultLine} onChange={(e) => setVaultLine(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>
          Save
        </Button>
        {farmer.status !== 'archived' && (
          <Button onClick={archive} variant="destructive" disabled={pending}>
            Archive
          </Button>
        )}
      </div>
    </div>
  )
}
