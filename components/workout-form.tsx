'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Plus, Trash2, Dumbbell, GripVertical } from 'lucide-react'
import { Exercise } from '@/app/lib/types'

const workoutFormSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  exercises: z.array(
    z.object({
      name: z.string().min(1, 'Exercise name is required'),
      sets: z.number().int().positive('Sets must be a positive integer'),
      reps: z.number().int().positive('Reps must be a positive integer'),
      weight: z.number().nonnegative('Weight must be 0 or greater').optional(),
    })
  ).min(1, 'At least one exercise is required'),
})

type WorkoutFormValues = z.infer<typeof workoutFormSchema>

interface WorkoutFormProps {
  onSubmit: (data: { name: string; exercises: Exercise[] }) => Promise<void>
  initialData?: { name: string; exercises: Exercise[] }
  isSubmitting?: boolean
}

export function WorkoutForm({ onSubmit, initialData, isSubmitting = false }: WorkoutFormProps) {
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: initialData || {
      name: '',
      exercises: [{ name: '', sets: 3, reps: 12, weight: undefined }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  const handleSubmit = async (data: WorkoutFormValues) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Workout Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Push Day, Leg Day, Full Body..." 
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-xs">
                Give your workout a memorable name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Exercises</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Add exercises to your workout</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', sets: 3, reps: 12, weight: undefined })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Exercise
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div 
                key={field.id} 
                className="group rounded-xl bg-secondary/30 border border-border/50 p-5 hover:border-border transition-colors animate-slide-up"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Dumbbell className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">Exercise {index + 1}</span>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel className="text-xs text-muted-foreground">Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Bench Press" 
                            className="h-10 bg-background/50 border-border/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`exercises.${index}.sets`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Sets</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            className="h-10 bg-background/50 border-border/50"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`exercises.${index}.reps`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Reps</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            className="h-10 bg-background/50 border-border/50"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`exercises.${index}.weight`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder="0"
                            className="h-10 bg-background/50 border-border/50"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === '' ? undefined : parseFloat(value) || 0)
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold glow" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            'Save Workout'
          )}
        </Button>
      </form>
    </Form>
  )
}
