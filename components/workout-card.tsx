'use client'

import Link from 'next/link'
import { Workout } from '@/app/lib/types'
import { Dumbbell, ChevronRight, Zap } from 'lucide-react'

interface WorkoutCardProps {
  workout: Workout
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const totalVolume = workout.exercises.reduce((acc, exercise) => {
    const volume = exercise.weight 
      ? exercise.sets * exercise.reps * exercise.weight 
      : exercise.sets * exercise.reps
    return acc + volume
  }, 0)

  return (
    <Link href={`/workouts/${workout.id}`}>
      <div className="group relative h-full overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-primary/50 hover:glow-sm cursor-pointer">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {workout.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>

          {/* Exercise Preview */}
          <div className="space-y-2 mb-4">
            {workout.exercises.slice(0, 3).map((exercise, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-secondary/50"
              >
                <span className="text-foreground/80 truncate flex-1">{exercise.name}</span>
                <span className="text-muted-foreground text-xs ml-2 whitespace-nowrap">
                  {exercise.sets}×{exercise.reps}
                  {exercise.weight !== undefined && exercise.weight !== null && (
                    <span className="text-primary ml-1">@{exercise.weight}kg</span>
                  )}
                </span>
              </div>
            ))}
            {workout.exercises.length > 3 && (
              <p className="text-xs text-muted-foreground pl-3">
                +{workout.exercises.length - 3} more exercises
              </p>
            )}
          </div>

          {/* Stats Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>
                {totalVolume.toLocaleString()} {workout.exercises.some(e => e.weight) ? 'kg volume' : 'total reps'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
