import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center glow-sm">
          <Dumbbell className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="text-6xl sm:text-7xl font-display font-bold text-gradient">404</h1>
          <p className="text-lg text-muted-foreground mt-2">
            This page skipped leg day and disappeared
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="lg" className="gap-2 glow">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
