'use client'

import { useState, useEffect } from 'react'
import { WorkoutCalendar } from '@/components/calendar'

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 border rounded-md hover:bg-accent"
          disabled={loading}
        >
          ← Previous
        </button>
        <h3 className="text-xl font-semibold">
          {new Date(year, month - 1).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 border rounded-md hover:bg-accent"
          disabled={loading}
        >
          Next →
        </button>
      </div>
      <WorkoutCalendar year={year} month={month} loggedDates={loggedDates} />
    </div>
  )
}

