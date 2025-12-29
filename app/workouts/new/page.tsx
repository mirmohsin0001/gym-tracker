'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WorkoutForm } from '@/components/workout-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/workouts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workouts
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Create New Workout</h2>
          <p className="text-muted-foreground">
            Define your workout routine with exercises, sets, and reps
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <WorkoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  )
}

