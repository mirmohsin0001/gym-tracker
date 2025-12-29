'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Workout } from '@/app/lib/types'
import { Dumbbell } from 'lucide-react'

interface WorkoutCardProps {
  workout: Workout
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Link href={`/workouts/${workout.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">{workout.name}</CardTitle>
          </div>
          <CardDescription>
            {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {workout.exercises.slice(0, 3).map((exercise, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {exercise.name} - {exercise.sets}x{exercise.reps}
                {exercise.weight !== undefined && exercise.weight !== null && (
                  <> @ {exercise.weight}kg</>
                )}
              </li>
            ))}
            {workout.exercises.length > 3 && (
              <li className="text-sm text-muted-foreground">
                + {workout.exercises.length - 3} more
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}

