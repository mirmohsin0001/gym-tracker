import { createClient } from '@/app/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Dumbbell, Zap, Hash, Weight, Repeat } from 'lucide-react'
import { Workout } from '@/app/lib/types'
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

  const totalVolume = workout.exercises.reduce((acc, exercise) => {
    const volume = exercise.weight 
      ? exercise.sets * exercise.reps * exercise.weight 
      : exercise.sets * exercise.reps
    return acc + volume
  }, 0)

  const totalSets = workout.exercises.reduce((acc, e) => acc + e.sets, 0)
  const totalReps = workout.exercises.reduce((acc, e) => acc + (e.sets * e.reps), 0)

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 max-w-4xl">
        {/* Back Button */}
        <Link href="/workouts">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workouts
          </Button>
        </Link>

        {/* Workout Header */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center glow-sm">
                <Dumbbell className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">{workout.name}</h1>
                <p className="text-muted-foreground">
                  {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                </p>
              </div>
            </div>
            <LogWorkoutButton workoutId={workout.id} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Hash className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sets</span>
              </div>
              <p className="text-2xl font-display font-bold">{totalSets}</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Repeat className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Reps</span>
              </div>
              <p className="text-2xl font-display font-bold">{totalReps}</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Volume</span>
              </div>
              <p className="text-2xl font-display font-bold">{totalVolume.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-muted-foreground uppercase tracking-wider">
            Exercises
          </h2>
          
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <div
                key={index}
                className="group rounded-2xl bg-card border border-border/50 p-5 hover:border-primary/50 transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center font-display font-bold text-lg text-muted-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {exercise.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5" />
                          {exercise.sets} sets
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat className="h-3.5 w-3.5" />
                          {exercise.reps} reps
                        </span>
                        {exercise.weight !== undefined && exercise.weight !== null && (
                          <span className="flex items-center gap-1 text-primary">
                            <Weight className="h-3.5 w-3.5" />
                            {exercise.weight} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-2xl sm:text-3xl font-display font-bold text-primary">
                      {exercise.weight !== undefined && exercise.weight !== null
                        ? (exercise.sets * exercise.reps * exercise.weight).toLocaleString()
                        : exercise.sets * exercise.reps}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {exercise.weight !== undefined && exercise.weight !== null
                        ? 'kg volume'
                        : 'total reps'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}
