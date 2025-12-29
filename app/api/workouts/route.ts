import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const workoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  exercises: z.array(z.object({
    name: z.string().min(1, 'Exercise name is required'),
    sets: z.number().int().positive('Sets must be a positive integer'),
    reps: z.number().int().positive('Reps must be a positive integer'),
    weight: z.number().nonnegative('Weight must be 0 or greater').optional(),
  })),
})

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workouts:', error)
      return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 })
    }

    return NextResponse.json(workouts)
  } catch (error) {
    console.error('Error in GET /api/workouts:', error)
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
    const validatedData = workoutSchema.parse(body)

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        exercises: validatedData.exercises,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating workout:', error)
      return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 })
    }

    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error in POST /api/workouts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

