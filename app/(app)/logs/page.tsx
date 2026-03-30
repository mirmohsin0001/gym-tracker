import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, Calendar, FileText, ChevronRight, ClipboardList } from 'lucide-react'
import { Workout, WorkoutLog } from '@/app/lib/types'
import { WorkoutLogCard, LogWithWorkout } from '@/components/workout-log-card'

// Component uses LogWithWorkout imported above

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
  const workoutIds = Array.from(new Set(logs.map((log) => log.workout_id)))
  
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

function getTotalVolume(log: LogWithWorkout) {
  const exercises = log.exercises?.length ? log.exercises : log.workout?.exercises
  if (!exercises) return 0
  return exercises.reduce((sum, ex) => {
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
    <div className="container mx-auto px-4 py-6 sm:py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Workout Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {logs.length} total {logs.length === 1 ? 'session' : 'sessions'} logged
          </p>
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
              <Button className="gap-2">Go to home</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedDates.map((date, dateIndex) => (
              <div 
                key={date} 
                className="rounded-2xl bg-card border border-border/50 animate-slide-up" 
                style={{ animationDelay: `${dateIndex * 50}ms` }}
              >
                {/* Date Header */}
                {(() => {
                  const dayVolume = groupedLogs[date].reduce((sum, log) => sum + getTotalVolume(log), 0)
                  return (
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-secondary/30 rounded-t-2xl">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold">{formatDate(date)}</p>
                        <p className="text-xs text-muted-foreground">{formatFullDate(date)}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {dayVolume > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-bold">{dayVolume.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">kg</span></p>
                            <p className="text-xs text-muted-foreground">total volume</p>
                          </div>
                        )}
                        <div className="hidden sm:flex items-center justify-center h-7 px-2.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {groupedLogs[date].length} {groupedLogs[date].length === 1 ? 'session' : 'sessions'}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Logs for this date */}
                <div className="divide-y divide-border/40">
                  {groupedLogs[date].map((log) => {
                    const volume = getTotalVolume(log)
                    
                    return (
                      <div key={log.id} className="block group border-b border-border/40 last:border-0 last:rounded-b-2xl">
                        <WorkoutLogCard log={log} volume={volume} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
