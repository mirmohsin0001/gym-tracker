import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, ArrowLeft, Calendar, Clock, FileText, ChevronRight, User, ClipboardList } from 'lucide-react'
import LogoutButton from '@/components/logout-button'
import { Workout, WorkoutLog } from '@/app/lib/types'

interface LogWithWorkout extends WorkoutLog {
  workout?: Workout
}

async function getWorkoutLogs(userId: string) {
  const supabase = createClient()
  
  // Get all workout logs ordered by date (latest first)
  const { data: logs, error: logsError } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (logsError) {
    console.error('Error fetching workout logs:', logsError)
    return []
  }

  if (!logs || logs.length === 0) return []

  // Get all unique workout IDs
  const workoutIds = [...new Set(logs.map(log => log.workout_id))]
  
  // Fetch all related workouts
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('*')
    .in('id', workoutIds)

  if (workoutsError) {
    console.error('Error fetching workouts:', workoutsError)
    return logs as LogWithWorkout[]
  }

  // Map workouts to logs
  const workoutMap = new Map(workouts?.map(w => [w.id, w]) || [])
  
  return logs.map(log => ({
    ...log,
    workout: workoutMap.get(log.workout_id)
  })) as LogWithWorkout[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const logDate = new Date(dateStr)
  logDate.setHours(0, 0, 0, 0)
  
  const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  })
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
}

function getTotalVolume(workout?: Workout) {
  if (!workout?.exercises) return 0
  return workout.exercises.reduce((sum, ex) => {
    return sum + (ex.sets * ex.reps * (ex.weight || 0))
  }, 0)
}

export default async function LogsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const logs = await getWorkoutLogs(user.id)

  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = log.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(log)
    return groups
  }, {} as Record<string, LogWithWorkout[]>)

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center glow-sm">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">GYMTRACK</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/body">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Body Map</span>
              </Button>
            </Link>
            <Link href="/logs">
              <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary">
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Logs</span>
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* Back Button & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold">Workout Logs</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {logs.length} total {logs.length === 1 ? 'session' : 'sessions'} logged
              </p>
            </div>
          </div>
        </div>

        {/* Logs List */}
        {logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No workout logs yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start logging your workouts to track your progress over time
            </p>
            <Link href="/dashboard">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date, dateIndex) => (
              <div key={date} className="animate-slide-up" style={{ animationDelay: `${dateIndex * 50}ms` }}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{formatDate(date)}</p>
                    <p className="text-xs text-muted-foreground">{formatFullDate(date)}</p>
                  </div>
                </div>

                {/* Logs for this date */}
                <div className="space-y-3 ml-11">
                  {groupedLogs[date].map((log) => {
                    const volume = getTotalVolume(log.workout)
                    
                    return (
                      <Link 
                        key={log.id} 
                        href={`/workouts/${log.workout_id}`}
                        className="block group"
                      >
                        <div className="rounded-xl bg-card border border-border/50 p-4 transition-all hover:border-primary/50 hover:glow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                  {log.workout?.name || 'Unknown Workout'}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                  {log.workout?.exercises && (
                                    <span>{log.workout.exercises.length} exercises</span>
                                  )}
                                  {volume > 0 && (
                                    <span>{volume.toLocaleString()} kg volume</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          
                          {log.notes && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {log.notes}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
