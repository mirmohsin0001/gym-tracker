'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Workout } from '@/app/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Dumbbell, ChevronRight, Zap, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface WorkoutCardProps {
  workout: Workout
  showActions?: boolean
}

export function WorkoutCard({ workout, showActions = false }: WorkoutCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const totalVolume = workout.exercises.reduce((acc, exercise) => {
    const volume = exercise.weight 
      ? exercise.sets * exercise.reps * exercise.weight 
      : exercise.sets * exercise.reps
    return acc + volume
  }, 0)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete workout')
      }

      toast.success('Workout deleted successfully')
      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete workout')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Link href={`/workouts/${workout.id}`}>
        <div className="group relative h-full overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-primary/50 hover:glow-sm cursor-pointer">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {workout.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                {showActions && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowMenu(!showMenu)
                      }}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {showMenu && (
                      <>
                        {/* Invisible backdrop to close menu */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowMenu(false)
                          }}
                        />
                        <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl bg-card border border-border shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowMenu(false)
                              router.push(`/workouts/${workout.id}/edit`)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowMenu(false)
                              setShowDeleteDialog(true)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Workout</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{workout.name}</strong>? This will also remove all associated workout logs. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
