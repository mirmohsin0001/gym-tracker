'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, Check } from 'lucide-react'
import { toast } from 'sonner'

interface LogWorkoutButtonProps {
  workoutId: string
}

export default function LogWorkoutButton({ workoutId }: LogWorkoutButtonProps) {
  const router = useRouter()
  const [isLogging, setIsLogging] = useState(false)

  const handleLogWorkout = async () => {
    setIsLogging(true)
    try {
      // Use local date components to avoid UTC offset issues
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const today = `${yyyy}-${mm}-${dd}` // YYYY-MM-DD format (local)

      const response = await fetch('/api/workout-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workout_id: workoutId,
          date: today,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          toast.info('Workout already logged for today')
        } else {
          throw new Error(error.error || 'Failed to log workout')
        }
      } else {
        toast.success('Workout logged successfully!')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to log workout')
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <Button onClick={handleLogWorkout} disabled={isLogging} size="lg">
      {isLogging ? (
        <>
          <Calendar className="h-4 w-4 mr-2 animate-spin" />
          Logging...
        </>
      ) : (
        <>
          <Check className="h-4 w-4 mr-2" />
          Log Today
        </>
      )}
    </Button>
  )
}

