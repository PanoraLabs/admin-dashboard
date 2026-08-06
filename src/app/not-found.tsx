import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sprout } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Sprout className="h-12 w-12 text-muted-foreground/40" />
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button variant="outline" render={<Link href="/" />}>
        Back to dashboard
      </Button>
    </div>
  )
}
