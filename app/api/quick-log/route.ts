import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().min(1, 'Sets must be at least 1'),
  reps: z.number().min(1, 'Reps must be at least 1'),
  weight: z.number().optional(),
})

const quickLogSchema = z.object({
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = quickLogSchema.parse(body)

    // Create a "Quick Log" workout with a timestamp to make it unique
    const timestamp = new Date().toISOString()
    const workoutName = `Quick Log - ${new Date(validatedData.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`

    // Create the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: workoutName,
        exercises: validatedData.exercises,
      })
      .select()
      .single()

    if (workoutError) {
      console.error('Error creating quick log workout:', workoutError)
      return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 })
    }

    // Log the workout for the specified date
    const { data: log, error: logError } = await supabase
      .from('workout_logs')
      .insert({
        user_id: user.id,
        workout_id: workout.id,
        date: validatedData.date,
        notes: validatedData.notes || null,
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating workout log:', logError)
      // Clean up the workout we just created
      await supabase.from('workouts').delete().eq('id', workout.id)
      return NextResponse.json({ error: 'Failed to log workout' }, { status: 500 })
    }

    return NextResponse.json({ workout, log }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error in POST /api/quick-log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
