import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('workout_logs')
    .select('date')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lt('date', endDate)

  if (error) {
    console.error('Error fetching workout log dates:', error)
    return NextResponse.json({ error: 'Failed to fetch dates' }, { status: 500 })
  }

  const dates = (data || []).map(log => log.date as string)
  
  return NextResponse.json({ dates })
}
