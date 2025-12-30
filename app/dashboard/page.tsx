import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WorkoutCalendar } from '@/components/calendar'
import { WorkoutCard } from '@/components/workout-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, LogOut } from 'lucide-react'
import { Workout } from '@/app/lib/types'
import LogoutButton from '@/components/logout-button'

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

async function getLoggedDates(userId: string, year: number, month: number) {
  const supabase = createClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('workout_logs')
    .select('date')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lt('date', endDate)

  if (error) {
    console.error('Error fetching workout logs:', error)
    return []
  }

  return (data || []).map(log => log.date as string)
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [workouts, loggedDates] = await Promise.all([
    getWorkouts(user.id),
    getLoggedDates(user.id, currentYear, currentMonth),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gym Tracker</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your workouts and progress
            </p>
          </div>
          <Link href="/workouts/new" className="hidden sm:block">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl">My Workouts</CardTitle>
                  <Link href="/workouts" className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View All
                    </Button>
                  </Link>
                  {/* Mobile-only New Workout button inside My Workouts card */}
                  <Link href="/workouts/new" className="w-full sm:hidden">
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Workout
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Your recently created workouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workouts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No workouts yet. Create your first workout to get started!
                    </p>
                    <Link href="/workouts/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workout
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {workouts.map((workout) => (
                      <WorkoutCard key={workout.id} workout={workout} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2">
            <WorkoutCalendar
              year={currentYear}
              month={currentMonth}
              loggedDates={loggedDates}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

