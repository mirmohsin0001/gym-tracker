import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
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
    <div className="container mx-auto px-4 py-6 sm:py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
            Workout Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse months and tap logged days to see sessions
          </p>
        </div>

        <CalendarClient
          initialYear={currentYear}
          initialMonth={currentMonth}
          initialLoggedDates={loggedDates}
        />
    </div>
  )
}

