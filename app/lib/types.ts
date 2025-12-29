export interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number // Weight in kg (optional for backwards compatibility)
}

export interface Workout {
  id: string
  user_id: string
  name: string
  exercises: Exercise[]
  created_at?: string
  updated_at?: string
}

export interface WorkoutLog {
  id: string
  user_id: string
  workout_id: string
  date: string // YYYY-MM-DD format
  notes?: string | null
  created_at?: string
}

export interface Profile {
  id: string
  email: string
  name?: string | null
}

