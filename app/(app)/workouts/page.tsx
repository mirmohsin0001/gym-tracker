import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WorkoutCard } from '@/components/workout-card'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell } from 'lucide-react'
import { Workout } from '@/app/lib/types'

async function getWorkouts(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workouts:', error)
    return []
  }

  return data as Workout[]
}

export default async function WorkoutsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const workouts = await getWorkouts(user.id)

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              My Workouts
            </h1>
            <p className="text-muted-foreground mt-1">
              {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'} created
            </p>
          </div>
          <Link href="/workouts/new" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 glow font-semibold">
              <Plus className="h-5 w-5" />
              New Workout
            </Button>
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 sm:p-16 text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Dumbbell className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">No workouts yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your first workout routine to start tracking your fitness journey. Every champion starts somewhere.
            </p>
            <Link href="/workouts/new">
              <Button size="lg" className="gap-2 glow">
                <Plus className="h-5 w-5" />
                Create Your First Workout
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {workouts.map((workout, index) => (
              <div 
                key={workout.id} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <WorkoutCard workout={workout} showActions />
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
