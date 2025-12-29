# Quick Setup Guide

## Database Setup (IMPORTANT - Do this first!)

The app requires database tables to be created in Supabase. Follow these steps:

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration
1. Open the file: `supabase/migrations/001_initial_schema.sql`
2. Copy ALL the contents (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor (Ctrl+V)
4. Click **Run** button (or press Ctrl+Enter)

You should see: "Success. No rows returned"

### Step 3: Verify Tables Were Created
In Supabase, go to **Table Editor** - you should see:
- ✅ `profiles`
- ✅ `workouts`
- ✅ `workout_logs`

## Environment Variables

Make sure you have a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from: Supabase Dashboard → Settings → API

## Run the App

```bash
npm run dev
```

Open http://localhost:3000

## Troubleshooting

**Error: "Could not find the table 'public.workouts'"**
→ You haven't run the SQL migration yet. Follow Step 1-2 above.

**Error: "Invalid API key"**
→ Check your `.env.local` file has the correct Supabase URL and anon key.

**Error: "relation does not exist"**
→ Run the SQL migration in Supabase SQL Editor.

