import { createFarmer } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewFarmerPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-2xl font-semibold">New farmer</h1>
      <form action={createFarmer} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Pak Sukarno" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="idLine">ID line</Label>
          <Input id="idLine" name="idLine" required placeholder="NIK 3329•••4521" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vaultLine">Vault line</Label>
          <Input id="vaultLine" name="vaultLine" required placeholder="Vault CHILI-GH-BREBES-Q2" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vaultId">Vault ID (optional)</Label>
          <Input id="vaultId" name="vaultId" placeholder="uuid — leave blank if unassigned" />
        </div>
        <Button type="submit">Create farmer</Button>
      </form>
    </div>
  )
}
