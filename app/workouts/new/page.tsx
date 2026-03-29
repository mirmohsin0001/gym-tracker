'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WorkoutForm } from '@/components/workout-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Dumbbell, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Exercise } from '@/app/lib/types'

export default function NewWorkoutPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: { name: string; exercises: Exercise[] }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create workout')
      }

      toast.success('Workout created successfully!')
      router.push('/workouts')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create workout')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/workouts" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center glow-sm group-hover:glow transition-all">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">GYMTRACK</span>
          </Link>
          <Link href="/workouts">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-10 max-w-2xl">
        {/* Back Button */}
        <Link href="/workouts">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workouts
          </Button>
        </Link>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center glow-sm">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Create Workout</h1>
          </div>
          <p className="text-muted-foreground max-w-md">
            Build your perfect workout routine. Add exercises, set your reps and weights.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 sm:p-8">
          <WorkoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  )
}
