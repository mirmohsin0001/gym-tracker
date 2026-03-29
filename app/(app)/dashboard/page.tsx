import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { WorkoutCard } from '@/components/workout-card'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell, Flame, Target, TrendingUp, Calendar, Zap } from 'lucide-react'
import { Workout } from '@/app/lib/types'

const WorkoutCalendar = dynamic(
  () => import('@/components/calendar').then((mod) => mod.WorkoutCalendar),
  {
    loading: () => (
      <div className="rounded-2xl border border-border/50 bg-card/50 p-4 space-y-4">
        <div className="h-5 w-36 rounded-md bg-muted animate-pulse" />
        <div className="h-[min(320px,55vh)] min-h-[240px] rounded-xl bg-muted/60 animate-pulse" />
      </div>
    ),
  }
)

const QuickLogDialog = dynamic(
  () => import('@/components/quick-log-dialog').then((mod) => mod.QuickLogDialog),
  {
    loading: () => (
      <Button
        variant="outline"
        size="lg"
        disabled
        className="gap-2 border-primary/50 font-semibold opacity-80"
      >
        <Zap className="h-5 w-5 text-primary" />
        Quick Log
      </Button>
    ),
  }
)

async function getWorkouts(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching workouts:', error)
    return []
  }

  return data as Workout[]
}



async function getStats(userId: string) {
  const supabase = createClient()
  
  // Get total workouts
  const { count: totalWorkouts } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get this month's logs
  const now = new Date()
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const { count: monthLogs } = await supabase
    .from('workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', startOfMonth)

  // Get current streak (simplified)
  const { data: recentLogs } = await supabase
    .from('workout_logs')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30)

  let streak = 0
  if (recentLogs && recentLogs.length > 0) {
    // Deduplicate dates (multiple logs on same day) and sort descending
    const uniqueDates = Array.from(new Set(recentLogs.map(l => l.date))).sort().reverse()
    
    // Use local date formatting to avoid UTC timezone mismatch
    const getLocalDateStr = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check consecutive days starting from today
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const checkStr = getLocalDateStr(checkDate)
      if (uniqueDates.includes(checkStr)) {
        streak++
      } else if (i === 0) {
        // No workout today - check if yesterday starts a streak
        continue
      } else {
        break
      }
    }
  }

  return {
    totalWorkouts: totalWorkouts || 0,
    monthLogs: monthLogs || 0,
    streak
  }
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [workouts, stats] = await Promise.all([
    getWorkouts(user.id),
    getStats(user.id),
  ])

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Champion'

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
              Welcome back
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
              Hey, <span className="text-gradient">{userName}</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md">
              {"Let's crush your fitness goals today. Every rep counts."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <QuickLogDialog />
            <Link href="/workouts/new" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 glow font-semibold text-base">
                <Plus className="h-5 w-5" />
                New Workout
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all hover:border-primary/50 hover:glow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-display font-bold">{stats.totalWorkouts}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Workouts</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all hover:border-orange-500/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-display font-bold">{stats.streak}</p>
            <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all hover:border-blue-500/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-display font-bold">{stats.monthLogs}</p>
            <p className="text-sm text-muted-foreground mt-1">This Month</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all hover:border-emerald-500/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-display font-bold">{stats.monthLogs}</p>
            <p className="text-sm text-muted-foreground mt-1">Days Active</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workouts Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold">My Workouts</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Your workout routines</p>
              </div>
              <Link href="/workouts">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                </Button>
              </Link>
            </div>

            {workouts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Create your first workout routine to start tracking your fitness journey
                </p>
                <Link href="/workouts/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Workout
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workouts.map((workout, index) => (
                  <div key={workout.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <WorkoutCard workout={workout} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">Activity</p>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" size="sm" className="text-primary gap-1.5 h-8">
                  <Calendar className="h-4 w-4" />
                  Full calendar
                </Button>
              </Link>
            </div>
            <WorkoutCalendar />
          </div>
        </div>
    </div>
  )
}
