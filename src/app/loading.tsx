import { AppWindow } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <AppWindow className="h-8 w-8 animate-pulse text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}
