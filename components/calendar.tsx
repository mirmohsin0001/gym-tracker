'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar as CalendarIcon, Dumbbell, ChevronRight } from 'lucide-react'
import Link from 'next/link'

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

export function WorkoutCalendar() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))
  const [loggedDates, setLoggedDates] = useState<string[]>([])
  const [loadingDates, setLoadingDates] = useState(false)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutLogWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch logged dates for the current view month
  const fetchLoggedDates = async (year: number, month: number) => {
    setLoadingDates(true)
    try {
      const response = await fetch(`/api/workout-logs/dates?year=${year}&month=${month}`)
      if (response.ok) {
        const data = await response.json()
        setLoggedDates(data.dates || [])
      }
    } catch (error) {
      console.error('Error fetching logged dates:', error)
    } finally {
      setLoadingDates(false)
    }
  }

  // Fetch dates when month changes
  useEffect(() => {
    const year = activeStartDate.getFullYear()
    const month = activeStartDate.getMonth() + 1
    fetchLoggedDates(year, month)
  }, [activeStartDate])

  const fetchWorkoutsForDate = async (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
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
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    if (loggedDates.includes(dateStr)) {
      return (
        <div className="flex justify-center mt-1">
          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
        </div>
      )
    }
    return null
  }

  const tileClassName = ({ date }: { date: Date }) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    const tyyyy = today.getFullYear()
    const tmm = String(today.getMonth() + 1).padStart(2, '0')
    const tdd = String(today.getDate()).padStart(2, '0')
    const todayStr = `${tyyyy}-${tmm}-${tdd}`
    
    if (dateStr === todayStr) {
      return 'react-calendar__tile--today'
    }
    return null
  }

  const onClickDay = (value: Date) => {
    const yyyy = value.getFullYear()
    const mm = String(value.getMonth() + 1).padStart(2, '0')
    const dd = String(value.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
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
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Activity Calendar</h3>
              <p className="text-xs text-muted-foreground">
                Track your workout consistency
              </p>
            </div>
          </div>
          {(activeStartDate.getMonth() !== today.getMonth() || activeStartDate.getFullYear() !== today.getFullYear()) && (
            <button
              onClick={() => setActiveStartDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/50 rounded-lg hover:bg-primary/10 transition-colors"
            >
              Go to Today
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-center relative">
          {loadingDates && (
            <div className="absolute inset-0 bg-card/50 flex items-center justify-center z-10 rounded-lg">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
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
        
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>Workout logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-transparent border-2 border-primary" />
            <span>Today</span>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md mx-4 sm:mx-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogTitle>
              <DialogDescription>
                Workouts completed on this day
              </DialogDescription>
            </DialogHeader>
            {loading ? (
              <div className="py-8 text-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground mt-3">Loading workouts...</p>
              </div>
            ) : workouts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No workouts logged for this date
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {workouts.map((log) => (
                  <Link key={log.id} href={`/workouts/${log.workout_id}`}>
                    <div className="group p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/50 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {log.workouts.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {log.workouts.exercises.length} exercises
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      {log.notes && (
                        <p className="mt-3 text-sm text-muted-foreground italic border-t border-border/50 pt-3">
                          &ldquo;{log.notes}&rdquo;
                        </p>
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
            font-family: var(--font-inter), system-ui, sans-serif;
          }
          .react-calendar__navigation {
            display: flex;
            height: 40px;
            margin-bottom: 0.75em;
          }
          .react-calendar__navigation button {
            min-width: 36px;
            background: none;
            font-size: 14px;
            color: hsl(0 0% 95%);
            font-weight: 600;
            border-radius: 8px;
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background-color: hsl(0 0% 12%);
          }
          .react-calendar__navigation button:disabled {
            color: hsl(0 0% 40%);
          }
          .react-calendar__month-view__weekdays {
            text-align: center;
            text-transform: uppercase;
            font-weight: 600;
            font-size: 0.65em;
            color: hsl(0 0% 50%);
            letter-spacing: 0.05em;
          }
          .react-calendar__month-view__weekdays abbr {
            text-decoration: none;
          }
          .react-calendar__month-view__days__day--weekend {
            color: hsl(0 0% 95%);
          }
          .react-calendar__month-view__days__day--neighboringMonth {
            color: hsl(0 0% 30%);
          }
          .react-calendar__tile {
            max-width: 100%;
            padding: 10px 4px;
            background: none;
            text-align: center;
            font-size: 0.85em;
            color: hsl(0 0% 80%);
            border-radius: 8px;
            transition: all 0.15s ease;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background-color: hsl(0 0% 15%);
          }
          .react-calendar__tile--now,
          .react-calendar__tile--today,
          .react-calendar__tile--now.react-calendar__tile--active,
          .react-calendar__tile--today.react-calendar__tile--active {
            background: transparent !important;
            color: hsl(142 76% 46%) !important;
            font-weight: 700;
            border: 2px solid hsl(142 76% 46%) !important;
            box-sizing: border-box;
          }
          .react-calendar__tile--now:enabled:hover,
          .react-calendar__tile--today:enabled:hover {
            background: hsl(142 76% 46% / 0.1) !important;
          }
          .react-calendar__tile--active:not(.react-calendar__tile--now):not(.react-calendar__tile--today) {
            background: hsl(0 0% 20%) !important;
            color: hsl(0 0% 95%) !important;
            font-weight: 600;
          }
          .react-calendar__tile--active:not(.react-calendar__tile--now):not(.react-calendar__tile--today):enabled:hover,
          .react-calendar__tile--active:not(.react-calendar__tile--now):not(.react-calendar__tile--today):enabled:focus {
            background: hsl(0 0% 25%) !important;
          }
        `}</style>
      </div>
    </div>
  )
}
