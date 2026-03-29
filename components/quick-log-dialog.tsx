'use client'

import { useState } from 'react'
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

interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number
}

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

export function QuickLogDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: 3, reps: 10, weight: undefined }
  ])
  const [notes, setNotes] = useState('')

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

  const handleQuickLog = async () => {
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

      const response = await fetch('/api/quick-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercises: validExercises,
          date: today,
          notes: notes.trim() || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to log exercises')
      }

      toast.success(`Logged ${validExercises.length} exercise${validExercises.length > 1 ? 's' : ''}!`)
      setOpen(false)
      setExercises([{ name: '', sets: 3, reps: 10, weight: undefined }])
      setNotes('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to log exercises')
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2 border-primary/50 hover:bg-primary/10 hover:border-primary font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          Quick Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            Quick Log Exercises
          </DialogTitle>
          <DialogDescription>
            Log individual exercises without creating a full workout routine.
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
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2 glow"
            onClick={handleQuickLog}
            disabled={isLogging}
          >
            {isLogging ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Log Exercises
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
