# Gym Tracker

A comprehensive Next.js 14 gym tracking web application built with Supabase, Tailwind CSS, and shadcn/ui. Track your workouts, log completed sessions, and visualize your progress with an interactive calendar.

## Features

- 🔐 **Authentication**: Email/password signup and login with Supabase Auth
- 📅 **Calendar View**: Interactive calendar showing green dots on days you've logged workouts
- 💪 **Workout Management**: Create, view, and manage your workout routines
- 📊 **Exercise Tracking**: Define exercises with sets and reps for each workout
- ✅ **Workout Logging**: Log completed workouts with a single click
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support
- 🔒 **Secure**: Row Level Security (RLS) policies ensure users can only access their own data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Calendar**: react-calendar
- **Icons**: lucide-react
- **Forms**: react-hook-form + zod
- **Notifications**: sonner

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd gym-tracker
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings** → **API**
3. Copy your project URL and anon key

### 4. Set Up Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the query to create all tables, indexes, and RLS policies

The migration creates:
- `profiles` table for user profiles
- `workouts` table for workout routines
- `workout_logs` table for tracking completed workouts
- Row Level Security policies for all tables
- Triggers for auto-creating profiles and updating timestamps

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

#### `profiles`
- `id` (UUID, Primary Key, references auth.users)
- `email` (TEXT)
- `name` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `workouts`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (TEXT)
- `exercises` (JSONB array: `[{name: string, sets: number, reps: number}]`)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `workout_logs`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `workout_id` (UUID, Foreign Key to workouts)
- `date` (DATE, format: YYYY-MM-DD)
- `notes` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- Unique constraint: `(user_id, workout_id, date)`

## Project Structure

```
gym-tracker/
├── app/
│   ├── api/
│   │   ├── workouts/
│   │   │   └── route.ts          # GET, POST workouts
│   │   └── workout-logs/
│   │       └── route.ts          # GET, POST workout logs
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard with calendar & workouts
│   │   └── calendar/
│   │       └── page.tsx          # Full calendar page
│   ├── workouts/
│   │   ├── page.tsx              # List all workouts
│   │   ├── new/
│   │   │   └── page.tsx          # Create new workout
│   │   └── [id]/
│   │       └── page.tsx          # Workout detail view
│   ├── login/
│   │   └── page.tsx              # Login/signup page
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts         # Server-side Supabase client
│   │   │   └── client.ts         # Client-side Supabase client
│   │   └── types.ts              # TypeScript type definitions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects)
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── calendar.tsx              # Calendar component
│   ├── calendar-client.tsx       # Calendar client wrapper
│   ├── workout-card.tsx          # Workout card component
│   ├── workout-form.tsx          # Workout form component
│   ├── log-workout-button.tsx    # Log workout button
│   └── logout-button.tsx         # Logout button
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
├── middleware.ts                 # Next.js middleware for auth
└── package.json
```

## Usage

### Creating a Workout

1. Click "New Workout" from the dashboard or workouts page
2. Enter a workout name (e.g., "Push Day")
3. Add exercises with name, sets, and reps
4. Click "Save Workout"

### Logging a Workout

1. Navigate to any workout detail page
2. Click the "Log Today" button
3. The workout will be logged for today's date
4. A green dot will appear on the calendar for today

### Viewing Calendar

1. Go to the dashboard to see the calendar with logged dates
2. Green dots indicate days you've logged workouts
3. Navigate to the full calendar page for month-by-month navigation

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The app is ready for production deployment on Vercel with zero configuration changes needed.

## Security

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- API routes validate authentication before processing requests
- Supabase handles secure password hashing and session management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

