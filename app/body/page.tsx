import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, ArrowLeft, User, Calendar, TrendingUp, ClipboardList } from 'lucide-react'
import LogoutButton from '@/components/logout-button'
import { MuscleMap } from '@/components/muscle-map'
import { Workout } from '@/app/lib/types'

async function getRecentWorkoutLogs(userId: string) {
  const supabase = createClient()
  
  // Get logs from the last 3 days
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const startDate = threeDaysAgo.toISOString().split('T')[0]
  
  const { data: logs, error: logsError } = await supabase
    .from('workout_logs')
    .select('date, workout_id')
    .eq('user_id', userId)
    .gte('date', startDate)
    .order('date', { ascending: false })

  if (logsError || !logs || logs.length === 0) {
    return []
  }

  // Get unique workout IDs
  const workoutIds = [...new Set(logs.map(log => log.workout_id))]
  
  // Fetch the workouts to get exercise details
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id, exercises')
    .in('id', workoutIds)

  if (workoutsError || !workouts) {
    return []
  }

  // Create a map of workout ID to exercises
  const workoutMap = new Map(workouts.map(w => [w.id, w.exercises]))

  // Combine logs with their exercises
  return logs.map(log => ({
    date: log.date,
    exercises: (workoutMap.get(log.workout_id) || []) as Array<{ name: string }>
  }))
}

async function getStats(userId: string) {
  const supabase = createClient()
  
  // Get total unique muscle groups trained this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const startDate = weekAgo.toISOString().split('T')[0]
  
  const { count: weekLogs } = await supabase
    .from('workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', startDate)

  // Get this month's logs
  const now = new Date()
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const { count: monthLogs } = await supabase
    .from('workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', startOfMonth)

  return {
    weekLogs: weekLogs || 0,
    monthLogs: monthLogs || 0,
  }
}

export default async function BodyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [workoutLogs, stats] = await Promise.all([
    getRecentWorkoutLogs(user.id),
    getStats(user.id),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center glow-sm hover:bg-primary/20 transition-colors">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
            </Link>
            <span className="text-xl font-display font-bold tracking-tight">GYMTRACK</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/body">
              <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Body Map</span>
              </Button>
            </Link>
            <Link href="/logs">
              <Button variant="outline" size="sm" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Logs</span>
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* Back button and title */}
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
                Body <span className="text-gradient">Map</span>
              </h1>
              <p className="text-muted-foreground">
                See which muscles you&apos;ve trained recently
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card border border-border/50 p-5 transition-all hover:border-primary/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold">{stats.weekLogs}</p>
            <p className="text-sm text-muted-foreground mt-1">Workouts This Week</p>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-5 transition-all hover:border-blue-500/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold">{stats.monthLogs}</p>
            <p className="text-sm text-muted-foreground mt-1">Workouts This Month</p>
          </div>
        </div>

        {/* Muscle Map */}
        <div className="rounded-2xl bg-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Muscle Activity</h2>
              <p className="text-xs text-muted-foreground">Last 3 days of training</p>
            </div>
          </div>
          
          <MuscleMap workoutLogs={workoutLogs} />
        </div>

        {/* Tips */}
        <div className="rounded-2xl bg-secondary/30 border border-border/50 p-6">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Muscles turn green when trained, based on exercises in your logged workouts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Color intensity fades over 3 days as muscles recover</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use this to ensure balanced training across all muscle groups</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
