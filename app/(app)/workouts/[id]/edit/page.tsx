'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Exercise, Workout } from '@/app/lib/types'

const WorkoutForm = dynamic(
  () => import('@/components/workout-form').then((mod) => mod.WorkoutForm),
  {
    loading: () => (
      <div className="space-y-6" aria-busy="true">
        <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-36 w-full rounded-xl bg-muted/80 animate-pulse" />
        <div className="h-36 w-full rounded-xl bg-muted/80 animate-pulse" />
        <div className="h-11 w-32 rounded-lg bg-muted animate-pulse" />
      </div>
    ),
  }
)

export default function EditWorkoutPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const response = await fetch(`/api/workouts`)
        if (!response.ok) throw new Error('Failed to fetch workouts')
        const workouts: Workout[] = await response.json()
        const found = workouts.find(w => w.id === params.id)
        if (!found) {
          toast.error('Workout not found')
          router.push('/workouts')
          return
        }
        setWorkout(found)
      } catch (error) {
        toast.error('Failed to load workout')
        router.push('/workouts')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkout()
  }, [params.id, router])

  const handleSubmit = async (data: { name: string; exercises: Exercise[] }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/workouts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update workout')
      }

      toast.success('Workout updated successfully!')
      router.push('/workouts')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update workout')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-2xl">
        <div className="space-y-6">
          <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-12 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-36 w-full rounded-xl bg-muted/80 animate-pulse" />
          <div className="h-36 w-full rounded-xl bg-muted/80 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!workout) return null

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 max-w-2xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link href="/workouts">
            <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workouts
            </Button>
          </Link>
          <Link href="/workouts">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center glow-sm">
              <Pencil className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Edit Workout</h1>
          </div>
          <p className="text-muted-foreground max-w-md">
            Update your workout routine. Modify exercises, reps, and weights.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 sm:p-8">
          <WorkoutForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            submitLabel="Update Workout"
            initialData={{
              name: workout.name,
              exercises: workout.exercises,
            }}
          />
        </div>
    </div>
  )
}
