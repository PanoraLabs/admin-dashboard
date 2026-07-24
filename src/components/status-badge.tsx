import { Badge } from '@/components/ui/badge'

const COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  poa_due: 'bg-amber-100 text-amber-800',
  pending: 'bg-slate-100 text-slate-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-neutral-200 text-neutral-600',
  verified: 'bg-green-100 text-green-800',
  new: 'bg-slate-100 text-slate-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={COLORS[status] ?? ''}>
      {status}
    </Badge>
  )
}
