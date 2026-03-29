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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      .update({
        name: validatedData.name,
        exercises: validatedData.exercises,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating workout:', error)
      return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 })
    }

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    return NextResponse.json(workout)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error in PUT /api/workouts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete associated workout logs first (foreign key constraint)
    await supabase
      .from('workout_logs')
      .delete()
      .eq('workout_id', params.id)
      .eq('user_id', user.id)

    // Delete the workout
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting workout:', error)
      return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/workouts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
