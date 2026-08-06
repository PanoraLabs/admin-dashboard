import { cn } from '@/lib/utils'

const COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  poa_due: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  new: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const LABELS: Record<string, string> = {
  active: 'Active',
  poa_due: 'PoA Due',
  pending: 'Pending',
  completed: 'Completed',
  archived: 'Archived',
  verified: 'Verified',
  new: 'New',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        COLORS[status] ?? 'bg-slate-100 text-slate-700',
      )}
    >
      {LABELS[status] ?? status}
    </span>
  )
}
