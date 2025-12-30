import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WorkoutCard } from '@/components/workout-card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import { Workout } from '@/app/lib/types'
import LogoutButton from '@/components/logout-button'

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-xl sm:text-2xl font-bold cursor-pointer hover:opacity-80">Gym Tracker</h1>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-5 sm:mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Workouts</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage and track your workout routines
            </p>
          </div>
          <Link href="/workouts/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4 text-lg">
              No workouts yet. Create your first workout to get started!
            </p>
            <Link href="/workouts/new">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Workout
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

