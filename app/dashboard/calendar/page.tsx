import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WorkoutCalendar } from '@/components/calendar'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/logout-button'
import CalendarClient from '@/components/calendar-client'

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

export default async function CalendarPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const loggedDates = await getLoggedDates(user.id, currentYear, currentMonth)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-xl sm:text-2xl font-bold cursor-pointer hover:opacity-80">Gym Tracker</h1>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Workout Calendar</h2>
          <p className="text-muted-foreground">
            View your workout history with green dots on logged days
          </p>
        </div>

        <CalendarClient
          initialYear={currentYear}
          initialMonth={currentMonth}
          initialLoggedDates={loggedDates}
        />
      </main>
    </div>
  )
}

