import { createClient } from '@/app/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { Workout } from '@/app/lib/types'
import LogoutButton from '@/components/logout-button'
import LogWorkoutButton from '@/components/log-workout-button'

async function getWorkout(id: string, userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as Workout
}

export default async function WorkoutDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const workout = await getWorkout(params.id, user.id)

  if (!workout) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/workouts">
            <h1 className="text-xl sm:text-2xl font-bold cursor-pointer hover:opacity-80">Gym Tracker</h1>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <Link href="/workouts">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workouts
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <CardTitle className="text-2xl sm:text-3xl">{workout.name}</CardTitle>
              </div>
              <LogWorkoutButton workoutId={workout.id} />
            </div>
            <CardDescription>
              {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight !== undefined && exercise.weight !== null && (
                        <> × {exercise.weight} kg</>
                      )}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      {exercise.weight !== undefined && exercise.weight !== null
                        ? (exercise.sets * exercise.reps * exercise.weight).toLocaleString()
                        : exercise.sets * exercise.reps}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {exercise.weight !== undefined && exercise.weight !== null
                        ? 'volume'
                        : 'total reps'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

