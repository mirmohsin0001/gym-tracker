import { createClient } from '@/app/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Dumbbell, Zap, Hash, Repeat, FileText } from 'lucide-react'
import { WorkoutLog, Workout } from '@/app/lib/types'

interface LogWithWorkout extends WorkoutLog {
  workout?: Workout
}

async function getWorkoutLog(id: string, userId: string) {
  const supabase = createClient()
  
  // Fetch the log
  const { data: logData, error: logError } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (logError || !logData) {
    return null
  }

  const log = logData as LogWithWorkout

  // Fetch associated workout if it exists
  if (log.workout_id) {
    const { data: workoutData } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', log.workout_id)
      .single()
      
    if (workoutData) {
      log.workout = workoutData as Workout
    }
  }

  return log
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
}

export default async function LogDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const log = await getWorkoutLog(params.id, user.id)

  if (!log) {
    notFound()
  }

  const exercises = log.exercises || []
  
  const totalVolume = exercises.reduce((acc, exercise) => {
    const volume = exercise.weight 
      ? exercise.sets * exercise.reps * exercise.weight 
      : exercise.sets * exercise.reps
    return acc + volume
  }, 0)

  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0)
  const totalReps = exercises.reduce((acc, e) => acc + (e.sets * e.reps), 0)

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 max-w-4xl">
        {/* Back Button */}
        <Link href="/logs">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Logs
          </Button>
        </Link>

        {/* Workout Log Header */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 sm:p-8 mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center glow-sm">
                <Dumbbell className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">
                  {log.workout?.name || 'Quick Session'}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(log.date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes (if any) */}
          {log.notes && (
            <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-start gap-2 text-muted-foreground">
                <FileText className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{log.notes}</p>
              </div>
            </div>
          )}

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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-muted-foreground uppercase tracking-wider">
              Performed Exercises
            </h2>
            <span className="text-sm font-medium text-muted-foreground">
              {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>
          
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
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
                      </div>
                    </div>
                  </div>
                  
                  {exercise.weight !== null && exercise.weight !== undefined && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold self-start sm:self-auto">
                      <Zap className="h-4 w-4" />
                      {exercise.weight} kg
                    </div>
                  )}
                </div>
              </div>
            ))}

            {exercises.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No exercises recorded for this session.
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
