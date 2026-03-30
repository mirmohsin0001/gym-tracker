'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Workout, WorkoutLog } from '@/app/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Dumbbell, ChevronRight, Zap, MoreVertical, Pencil, Trash2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { WorkoutLogDialog } from './workout-log-dialog'

export interface LogWithWorkout extends WorkoutLog {
  workout?: Workout
}

interface WorkoutLogCardProps {
  log: LogWithWorkout
  volume: number
}

export function WorkoutLogCard({ log, volume }: WorkoutLogCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/workout-logs/${log.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete workout log')
      }

      toast.success('Workout log deleted successfully')
      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete workout log')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle entire card click
  const handleCardClick = (e: React.MouseEvent) => {
    router.push(`/logs/${log.id}`)
  }

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="block group cursor-pointer rounded-[inherit]"
      >
        <div className="px-5 py-4 transition-all hover:bg-secondary/40 relative rounded-[inherit]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                <Dumbbell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0 pr-12">
                <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                  {log.workout?.name || 'Quick Session'}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                  {(log.exercises?.length || log.workout?.exercises?.length) ? (
                    <span>{log.exercises?.length || log.workout?.exercises?.length} exercises</span>
                  ) : null}
                  {volume > 0 && (
                    <span>{volume.toLocaleString()} kg volume</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
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
                          setShowEditModal(true)
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
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
          
          {log.notes && (
            <div className="mt-3 pt-3 border-t border-border/30 ml-[52px]">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {log.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Workout Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recorded session? This action cannot be undone.
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

      <WorkoutLogDialog 
        workout={log.workout} 
        logToEdit={log}
        open={showEditModal} 
        onOpenChange={setShowEditModal} 
      />
    </>
  )
}
