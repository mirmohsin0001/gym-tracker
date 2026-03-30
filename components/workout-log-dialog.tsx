'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Zap, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { Workout, Exercise, WorkoutLog } from '@/app/lib/types'

const COMMON_EXERCISES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Barbell Row',
  'Pull-ups',
  'Bicep Curls',
  'Tricep Dips',
  'Leg Press',
  'Lat Pulldown',
  'Lunges',
  'Plank',
]

interface WorkoutLogDialogProps {
  workout?: Workout
  logToEdit?: WorkoutLog
  children?: React.ReactNode // Custom trigger if any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function WorkoutLogDialog({ workout, logToEdit, children, open: controlledOpen, onOpenChange }: WorkoutLogDialogProps) {
  const router = useRouter()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setIsOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setUncontrolledOpen(newOpen)
    }
  }

  const [isLogging, setIsLogging] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: 3, reps: 10, weight: undefined }
  ])
  const [notes, setNotes] = useState('')

  // Initialize form with template data if editing an existing workout
  useEffect(() => {
    if (isOpen) {
      if (logToEdit && logToEdit.exercises && logToEdit.exercises.length > 0) {
        setExercises(JSON.parse(JSON.stringify(logToEdit.exercises)))
        setNotes(logToEdit.notes || '')
      } else if (workout && workout.exercises.length > 0) {
        setExercises(JSON.parse(JSON.stringify(workout.exercises)))
        setNotes('')
      } else {
        setExercises([{ name: '', sets: 3, reps: 10, weight: undefined }])
        setNotes('')
      }
    }
  }, [isOpen, workout, logToEdit])

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: undefined }])
  }

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
    }
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises]
    if (field === 'name') {
      updated[index].name = value as string
    } else if (field === 'weight') {
      updated[index].weight = value === '' ? undefined : Number(value)
    } else {
      updated[index][field] = Number(value)
    }
    setExercises(updated)
  }

  const selectCommonExercise = (exerciseName: string, index: number) => {
    const updated = [...exercises]
    updated[index].name = exerciseName
    setExercises(updated)
  }

  const handleLogWorkout = async () => {
    // Validate exercises
    const validExercises = exercises.filter(e => e.name.trim() !== '')
    if (validExercises.length === 0) {
      toast.error('Please add at least one exercise')
      return
    }

    setIsLogging(true)
    try {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const today = `${yyyy}-${mm}-${dd}`

      const isEditing = !!logToEdit;
      const url = isEditing ? `/api/workout-logs/${logToEdit.id}` : '/api/workout-logs';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = isEditing ? {
        exercises: validExercises,
        notes: notes.trim() || null,
      } : {
        workout_id: workout?.id || undefined,
        exercises: validExercises,
        date: today,
        notes: notes.trim() || null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${isEditing ? 'update' : 'log'} workout`)
      }

      toast.success(isEditing ? 'Workout log updated successfully!' : workout ? 'Workout logged! Keep crushing it!' : `Logged ${validExercises.length} exercise${validExercises.length > 1 ? 's' : ''}!`)
      setIsOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to log workout')
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      ) : controlledOpen === undefined ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2 border-primary/50 hover:bg-primary/10 hover:border-primary font-semibold">
            <Zap className="h-5 w-5 text-primary" />
            Quick Log
          </Button>
        </DialogTrigger>
      ) : null}
      
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            {logToEdit ? 'Edit Workout Log' : workout ? `Log ${workout.name}` : 'Quick Log Exercises'}
          </DialogTitle>
          <DialogDescription>
            {logToEdit 
              ? 'Make changes to your logged workout session.'
              : workout 
              ? 'Review and adjust your logs before saving.' 
              : 'Log individual exercises without creating a full workout routine.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {exercises.map((exercise, index) => (
            <div key={index} className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Exercise {index + 1}</span>
                {exercises.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeExercise(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`exercise-${index}`} className="text-sm">Exercise Name</Label>
                <Input
                  id={`exercise-${index}`}
                  placeholder="e.g., Bench Press"
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                  className="bg-background"
                />
                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_EXERCISES.slice(0, 6).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => selectCommonExercise(name, index)}
                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                        exercise.name === name 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-secondary/50 border-border/50 hover:border-primary/50 hover:bg-primary/10'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`sets-${index}`} className="text-sm">Sets</Label>
                  <Input
                    id={`sets-${index}`}
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`reps-${index}`} className="text-sm">Reps</Label>
                  <Input
                    id={`reps-${index}`}
                    type="number"
                    min="1"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`weight-${index}`} className="text-sm">Weight (kg)</Label>
                  <Input
                    id={`weight-${index}`}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={exercise.weight ?? ''}
                    onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addExercise}
            className="w-full gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add Another Exercise
          </Button>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="How did it feel?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2 glow"
            onClick={handleLogWorkout}
            disabled={isLogging}
          >
            {isLogging ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                {logToEdit ? 'Saving...' : 'Logging...'}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {logToEdit ? 'Save Changes' : `Log ${workout ? 'Workout' : 'Exercises'}`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
