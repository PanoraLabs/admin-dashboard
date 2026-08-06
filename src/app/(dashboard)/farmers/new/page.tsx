import Link from 'next/link'
import { createFarmer } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewFarmerPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/farmers" />}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to farmers
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">New farmer</h1>
        <p className="mt-1 text-sm text-muted-foreground">Register a new farmer</p>
      </div>

      <Card>
        <CardContent className="pt-6">
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
            <Button type="submit" className="w-full">
              Create farmer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
