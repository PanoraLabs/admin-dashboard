import Link from 'next/link'
import { createVault } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

const CROP_KINDS = ['chili', 'shallot', 'coffee', 'vanilla', 'rice', 'cacao']

export default function NewVaultPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/vaults" />}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to vaults
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">New vault</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create a new crop cycle</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={createVault} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" required placeholder="CHILI-GH-BREBES-Q3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cropKind">Crop kind</Label>
              <Select name="cropKind" required>
                <SelectTrigger id="cropKind">
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {CROP_KINDS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cropLabel">Crop label</Label>
              <Input id="cropLabel" name="cropLabel" required placeholder="Chili — Greenhouse" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required placeholder="Brebes, Central Java" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dayTotal">Cycle length (days)</Label>
              <Input id="dayTotal" name="dayTotal" type="number" min={1} required defaultValue={90} />
            </div>
            <Button type="submit" className="w-full">
              Create vault
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
