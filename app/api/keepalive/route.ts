import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Perform a lightweight query to wake up the database.
    // Even if Row Level Security (RLS) returns 0 rows, 
    // it still counts as database activity for Supabase.
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Keep-alive ping failed:', error)
      return NextResponse.json(
        { status: 'error', message: 'Failed to ping database' }, 
        { status: 500 }
      )
    }

    return NextResponse.json(
      { status: 'ok', message: 'Database is awake' }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Keep-alive ping error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
