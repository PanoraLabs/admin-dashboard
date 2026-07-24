import { createVault } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CROP_KINDS = ['chili', 'shallot', 'coffee', 'vanilla', 'rice', 'cacao']

export default function NewVaultPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-2xl font-semibold">New vault</h1>
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
        <Button type="submit">Create vault</Button>
      </form>
    </div>
  )
}
