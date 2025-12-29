import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required (YYYY-MM-DD)' }, { status: 400 })
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    // Fetch workout logs for the specific date with workout details
    const { data: logs, error } = await supabase
      .from('workout_logs')
      .select(`
        id,
        workout_id,
        date,
        notes,
        created_at,
        workouts (
          id,
          name,
          exercises
        )
      `)
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workout logs by date:', error)
      return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 })
    }

    return NextResponse.json(logs || [])
  } catch (error) {
    console.error('Error in GET /api/workout-logs/by-date:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

