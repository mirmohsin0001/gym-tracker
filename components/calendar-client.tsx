'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const WorkoutCalendar = dynamic(
  () => import('@/components/calendar').then((mod) => mod.WorkoutCalendar),
  {
    loading: () => (
      <div className="min-h-[280px] rounded-xl bg-muted/50 animate-pulse" aria-hidden />
    ),
  }
)

interface CalendarClientProps {
  initialYear: number
  initialMonth: number
  initialLoggedDates: string[]
}

export default function CalendarClient({
  initialYear,
  initialMonth,
  initialLoggedDates,
}: CalendarClientProps) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [loggedDates, setLoggedDates] = useState(initialLoggedDates)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLoggedDates = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/workout-logs?year=${year}&month=${month}`
        )
        if (response.ok) {
          const dates = await response.json()
          setLoggedDates(dates)
        }
      } catch (error) {
        console.error('Error fetching logged dates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoggedDates()
  }, [year, month])

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  return (
    <div>
      <WorkoutCalendar />
    </div>
  )
}

