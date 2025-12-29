import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const workoutLogSchema = z.object({
  workout_id: z.string().uuid('Invalid workout ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!year || !month) {
      return NextResponse.json({ error: 'Year and month parameters are required' }, { status: 400 })
    }

    // Get start and end dates for the month
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1
    const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year)
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    const { data: logs, error } = await supabase
      .from('workout_logs')
      .select('date')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lt('date', endDate)

    if (error) {
      console.error('Error fetching workout logs:', error)
      return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 })
    }

    // Return unique dates as YYYY-MM-DD strings
    const dates = Array.from(new Set(logs?.map(log => log.date) || []))
    return NextResponse.json(dates)
  } catch (error) {
    console.error('Error in GET /api/workout-logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = workoutLogSchema.parse(body)

    // Verify workout belongs to user
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', validatedData.workout_id)
      .eq('user_id', user.id)
      .single()

    if (workoutError || !workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    const { data: log, error } = await supabase
      .from('workout_logs')
      .insert({
        user_id: user.id,
        workout_id: validatedData.workout_id,
        date: validatedData.date,
        notes: validatedData.notes || null,
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation (already logged today)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Workout already logged for this date' }, { status: 409 })
      }
      console.error('Error creating workout log:', error)
      return NextResponse.json({ error: 'Failed to create workout log' }, { status: 500 })
    }

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error in POST /api/workout-logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

