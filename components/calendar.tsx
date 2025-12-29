'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import type { Value } from 'react-calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar as CalendarIcon, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface WorkoutCalendarProps {
  year: number
  month: number
  loggedDates: string[] // YYYY-MM-DD format
}

interface WorkoutLogWithDetails {
  id: string
  workout_id: string
  date: string
  notes?: string | null
  created_at?: string
  workouts: {
    id: string
    name: string
    exercises: Array<{
      name: string
      sets: number
      reps: number
      weight?: number
    }>
  }
}

export function WorkoutCalendar({ year, month, loggedDates }: WorkoutCalendarProps) {
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date(year, month - 1, 1))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    setActiveStartDate(new Date(year, month - 1, 1))
  }, [year, month])

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutLogWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchWorkoutsForDate = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    setLoading(true)
    setDialogOpen(true)

    try {
      const response = await fetch(`/api/workout-logs/by-date?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setWorkouts(data)
      }
    } catch (error) {
      console.error('Error fetching workouts for date:', error)
    } finally {
      setLoading(false)
    }
  }

  const tileContent = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0]
    if (loggedDates.includes(dateStr)) {
      return (
        <div className="flex justify-center mt-1">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
        </div>
      )
    }
    return null
  }

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]
    
    if (dateStr === todayStr) {
      return 'react-calendar__tile--today'
    }
    return null
  }

  const onClickDay = (value: Date) => {
    const dateStr = value.toISOString().split('T')[0]
    if (loggedDates.includes(dateStr)) {
      fetchWorkoutsForDate(value)
    }
  }

  const onActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setActiveStartDate(activeStartDate)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <CardTitle className="text-lg sm:text-xl">Workout Calendar</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Green dots indicate days you logged workouts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Calendar
            value={today}
            activeStartDate={activeStartDate}
            onActiveStartDateChange={onActiveStartDateChange}
            tileContent={tileContent}
            tileClassName={tileClassName}
            onClickDay={onClickDay}
            className="w-full border-none"
            view="month"
          />
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Workouts on {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Click on a workout to view details
              </DialogDescription>
            </DialogHeader>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : workouts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No workouts logged for this date
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {workouts.map((log) => (
                  <Link key={log.id} href={`/workouts/${log.workout_id}`}>
                    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{log.workouts.name}</h3>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.workouts.exercises.length} {log.workouts.exercises.length === 1 ? 'exercise' : 'exercises'}
                      </div>
                      {log.notes && (
                        <div className="mt-2 text-sm text-muted-foreground italic">
                          "{log.notes}"
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
        <style jsx global>{`
          .react-calendar {
            width: 100%;
            background: transparent;
            border: none;
            font-family: inherit;
          }
          .react-calendar__navigation {
            display: flex;
            height: 36px;
            margin-bottom: 0.75em;
          }
          .react-calendar__navigation button {
            min-width: 32px;
            background: none;
            font-size: 14px;
            margin-top: 4px;
          }
          @media (min-width: 640px) {
            .react-calendar__navigation {
              height: 44px;
              margin-bottom: 1em;
            }
            .react-calendar__navigation button {
              min-width: 44px;
              font-size: 16px;
              margin-top: 8px;
            }
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background-color: hsl(var(--accent));
          }
          .react-calendar__month-view__weekdays {
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 0.75em;
            color: hsl(var(--muted-foreground));
          }
          .react-calendar__month-view__days__day--weekend {
            color: hsl(var(--foreground));
          }
          .react-calendar__tile {
            max-width: 100%;
            padding: 8px 4px;
            background: none;
            text-align: center;
            line-height: 16px;
            font-size: 0.75em;
          }
          @media (min-width: 640px) {
            .react-calendar__tile {
              padding: 10px 6.6667px;
              font-size: 0.833em;
            }
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background-color: hsl(var(--accent));
            border-radius: 4px;
          }
          .react-calendar__tile--today {
            background: hsl(var(--accent));
            border-radius: 4px;
            font-weight: bold;
          }
          .react-calendar__tile--now {
            background: hsl(var(--accent));
            border-radius: 4px;
          }
          .react-calendar__tile--active {
            background: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            border-radius: 4px;
          }
          .react-calendar__tile--active:enabled:hover,
          .react-calendar__tile--active:enabled:focus {
            background: hsl(var(--primary));
          }
        `}</style>
      </CardContent>
    </Card>
  )
}

