'use client'

import { useMemo } from 'react'

// Mapping common exercises to muscle groups
const exerciseToMuscles: Record<string, string[]> = {
  // Chest
  'bench press': ['chest', 'front-deltoid', 'triceps'],
  'incline bench press': ['chest', 'front-deltoid', 'triceps'],
  'decline bench press': ['chest', 'triceps'],
  'chest press': ['chest', 'front-deltoid', 'triceps'],
  'push up': ['chest', 'front-deltoid', 'triceps'],
  'pushup': ['chest', 'front-deltoid', 'triceps'],
  'push-up': ['chest', 'front-deltoid', 'triceps'],
  'dumbbell fly': ['chest'],
  'cable fly': ['chest'],
  'chest fly': ['chest'],
  'pec deck': ['chest'],
  
  // Back
  'deadlift': ['lower-back', 'glutes', 'hamstrings', 'traps', 'lats'],
  'pull up': ['lats', 'biceps', 'rear-deltoid'],
  'pullup': ['lats', 'biceps', 'rear-deltoid'],
  'pull-up': ['lats', 'biceps', 'rear-deltoid'],
  'chin up': ['lats', 'biceps'],
  'chinup': ['lats', 'biceps'],
  'chin-up': ['lats', 'biceps'],
  'lat pulldown': ['lats', 'biceps'],
  'row': ['lats', 'rear-deltoid', 'biceps', 'traps'],
  'barbell row': ['lats', 'rear-deltoid', 'biceps', 'traps'],
  'dumbbell row': ['lats', 'rear-deltoid', 'biceps'],
  'cable row': ['lats', 'rear-deltoid', 'biceps'],
  'seated row': ['lats', 'rear-deltoid', 'biceps'],
  't-bar row': ['lats', 'rear-deltoid', 'traps'],
  'face pull': ['rear-deltoid', 'traps'],
  'shrug': ['traps'],
  'back extension': ['lower-back'],
  'hyperextension': ['lower-back', 'glutes'],
  
  // Shoulders
  'shoulder press': ['front-deltoid', 'side-deltoid', 'triceps'],
  'overhead press': ['front-deltoid', 'side-deltoid', 'triceps'],
  'military press': ['front-deltoid', 'side-deltoid', 'triceps'],
  'lateral raise': ['side-deltoid'],
  'side raise': ['side-deltoid'],
  'front raise': ['front-deltoid'],
  'rear delt fly': ['rear-deltoid'],
  'reverse fly': ['rear-deltoid'],
  'arnold press': ['front-deltoid', 'side-deltoid', 'triceps'],
  'upright row': ['traps', 'side-deltoid'],
  
  // Arms
  'bicep curl': ['biceps'],
  'biceps curl': ['biceps'],
  'curl': ['biceps'],
  'hammer curl': ['biceps', 'forearms'],
  'preacher curl': ['biceps'],
  'concentration curl': ['biceps'],
  'cable curl': ['biceps'],
  'tricep extension': ['triceps'],
  'triceps extension': ['triceps'],
  'tricep pushdown': ['triceps'],
  'triceps pushdown': ['triceps'],
  'skull crusher': ['triceps'],
  'skullcrusher': ['triceps'],
  'dip': ['triceps', 'chest', 'front-deltoid'],
  'dips': ['triceps', 'chest', 'front-deltoid'],
  'close grip bench press': ['triceps', 'chest'],
  'wrist curl': ['forearms'],
  'reverse curl': ['forearms', 'biceps'],
  
  // Legs
  'squat': ['quads', 'glutes', 'hamstrings'],
  'back squat': ['quads', 'glutes', 'hamstrings', 'lower-back'],
  'front squat': ['quads', 'glutes'],
  'leg press': ['quads', 'glutes', 'hamstrings'],
  'lunge': ['quads', 'glutes', 'hamstrings'],
  'lunges': ['quads', 'glutes', 'hamstrings'],
  'walking lunge': ['quads', 'glutes', 'hamstrings'],
  'leg extension': ['quads'],
  'leg curl': ['hamstrings'],
  'hamstring curl': ['hamstrings'],
  'romanian deadlift': ['hamstrings', 'glutes', 'lower-back'],
  'rdl': ['hamstrings', 'glutes', 'lower-back'],
  'stiff leg deadlift': ['hamstrings', 'glutes', 'lower-back'],
  'hip thrust': ['glutes', 'hamstrings'],
  'glute bridge': ['glutes'],
  'calf raise': ['calves'],
  'calf raises': ['calves'],
  'seated calf raise': ['calves'],
  'standing calf raise': ['calves'],
  'leg raise': ['abs'],
  'hack squat': ['quads', 'glutes'],
  'goblet squat': ['quads', 'glutes'],
  'bulgarian split squat': ['quads', 'glutes', 'hamstrings'],
  'step up': ['quads', 'glutes'],
  'step ups': ['quads', 'glutes'],
  
  // Core
  'crunch': ['abs'],
  'crunches': ['abs'],
  'sit up': ['abs'],
  'situp': ['abs'],
  'sit-up': ['abs'],
  'plank': ['abs', 'obliques'],
  'side plank': ['obliques'],
  'russian twist': ['obliques', 'abs'],
  'bicycle crunch': ['abs', 'obliques'],
  'hanging leg raise': ['abs'],
  'ab wheel': ['abs'],
  'cable crunch': ['abs'],
  'wood chop': ['obliques', 'abs'],
  'mountain climber': ['abs'],
  'mountain climbers': ['abs'],
  'v-up': ['abs'],
  'v up': ['abs'],
  'toe touch': ['abs'],
}

// Get muscles for an exercise name (fuzzy matching)
function getMusclesForExercise(exerciseName: string): string[] {
  const normalized = exerciseName.toLowerCase().trim()
  
  // Direct match
  if (exerciseToMuscles[normalized]) {
    return exerciseToMuscles[normalized]
  }
  
  // Partial match
  for (const [key, muscles] of Object.entries(exerciseToMuscles)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return muscles
    }
  }
  
  return []
}

interface MuscleActivity {
  muscle: string
  lastTrainedDaysAgo: number
}

interface MuscleMapProps {
  workoutLogs: Array<{
    date: string
    exercises: Array<{ name: string }>
  }>
}

export function MuscleMap({ workoutLogs }: MuscleMapProps) {
  const muscleActivity = useMemo(() => {
    const activity: Record<string, number> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (const log of workoutLogs) {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      const daysAgo = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysAgo > 3) continue // Only track last 3 days
      
      for (const exercise of log.exercises) {
        const muscles = getMusclesForExercise(exercise.name)
        for (const muscle of muscles) {
          if (activity[muscle] === undefined || activity[muscle] > daysAgo) {
            activity[muscle] = daysAgo
          }
        }
      }
    }
    
    return activity
  }, [workoutLogs])

  // Get color based on days ago (0 = bright green, 3 = back to gray)
  const getMuscleColor = (muscle: string): string => {
    const daysAgo = muscleActivity[muscle]
    if (daysAgo === undefined) {
      return '#3a3a3a' // Default gray
    }
    
    // Saturation decreases from 100% at day 0 to 0% at day 3+
    const saturation = Math.max(0, 100 - (daysAgo * 33))
    const lightness = 35 + (daysAgo * 5) // Gets slightly lighter as it fades
    
    if (saturation === 0) {
      return '#3a3a3a'
    }
    
    return `hsl(142, ${saturation}%, ${lightness}%)`
  }

  const getMuscleOpacity = (muscle: string): number => {
    const daysAgo = muscleActivity[muscle]
    if (daysAgo === undefined) return 1
    return 1
  }

  // List of trained muscles for the legend
  const trainedMuscles = Object.entries(muscleActivity)
    .filter(([_, days]) => days <= 3)
    .sort((a, b) => a[1] - b[1])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:gap-8">
        {/* Front View */}
        <div className="space-y-3">
          <h3 className="text-center text-sm font-medium text-muted-foreground">Front</h3>
          <div className="relative aspect-[1/2] w-full max-w-[200px] mx-auto">
            <svg viewBox="0 0 200 400" className="w-full h-full">
              {/* Head */}
              <ellipse cx="100" cy="30" rx="25" ry="28" fill="#4a4a4a" />
              
              {/* Neck */}
              <rect x="90" y="55" width="20" height="15" fill="#4a4a4a" />
              
              {/* Traps */}
              <path 
                d="M70 70 Q100 60 130 70 L120 85 Q100 80 80 85 Z" 
                fill={getMuscleColor('traps')} 
                opacity={getMuscleOpacity('traps')}
              />
              
              {/* Front Deltoids */}
              <ellipse cx="60" cy="90" rx="15" ry="18" fill={getMuscleColor('front-deltoid')} opacity={getMuscleOpacity('front-deltoid')} />
              <ellipse cx="140" cy="90" rx="15" ry="18" fill={getMuscleColor('front-deltoid')} opacity={getMuscleOpacity('front-deltoid')} />
              
              {/* Chest */}
              <path 
                d="M70 85 Q85 80 100 85 Q115 80 130 85 L130 120 Q100 130 70 120 Z" 
                fill={getMuscleColor('chest')} 
                opacity={getMuscleOpacity('chest')}
              />
              
              {/* Biceps */}
              <ellipse cx="50" cy="125" rx="12" ry="25" fill={getMuscleColor('biceps')} opacity={getMuscleOpacity('biceps')} />
              <ellipse cx="150" cy="125" rx="12" ry="25" fill={getMuscleColor('biceps')} opacity={getMuscleOpacity('biceps')} />
              
              {/* Abs */}
              <path 
                d="M80 120 L120 120 L118 180 Q100 185 82 180 Z" 
                fill={getMuscleColor('abs')} 
                opacity={getMuscleOpacity('abs')}
              />
              
              {/* Obliques */}
              <path 
                d="M70 120 L80 120 L82 180 L75 175 Q68 150 70 120" 
                fill={getMuscleColor('obliques')} 
                opacity={getMuscleOpacity('obliques')}
              />
              <path 
                d="M130 120 L120 120 L118 180 L125 175 Q132 150 130 120" 
                fill={getMuscleColor('obliques')} 
                opacity={getMuscleOpacity('obliques')}
              />
              
              {/* Forearms */}
              <ellipse cx="45" cy="165" rx="8" ry="25" fill={getMuscleColor('forearms')} opacity={getMuscleOpacity('forearms')} />
              <ellipse cx="155" cy="165" rx="8" ry="25" fill={getMuscleColor('forearms')} opacity={getMuscleOpacity('forearms')} />
              
              {/* Hands */}
              <ellipse cx="42" cy="200" rx="8" ry="12" fill="#4a4a4a" />
              <ellipse cx="158" cy="200" rx="8" ry="12" fill="#4a4a4a" />
              
              {/* Quads - Left leg */}
              <path 
                d="M75 190 L88 185 L90 280 L70 280 Q68 235 75 190" 
                fill={getMuscleColor('quads')} 
                opacity={getMuscleOpacity('quads')}
              />
              
              {/* Quads - Right leg */}
              <path 
                d="M125 190 L112 185 L110 280 L130 280 Q132 235 125 190" 
                fill={getMuscleColor('quads')} 
                opacity={getMuscleOpacity('quads')}
              />
              
              {/* Quads - Inner thigh (with clear separation) */}
              <path 
                d="M88 185 L95 188 L95 280 L90 280 Z" 
                fill={getMuscleColor('quads')} 
                opacity={getMuscleOpacity('quads')}
              />
              <path 
                d="M112 185 L105 188 L105 280 L110 280 Z" 
                fill={getMuscleColor('quads')} 
                opacity={getMuscleOpacity('quads')}
              />
              
              {/* Knees */}
              <ellipse cx="80" cy="290" rx="12" ry="10" fill="#4a4a4a" />
              <ellipse cx="120" cy="290" rx="12" ry="10" fill="#4a4a4a" />
              
              {/* Lower legs / Calves (front view shows tibialis) */}
              <path 
                d="M70 300 L90 300 L85 370 L72 370 Q68 335 70 300" 
                fill="#4a4a4a"
              />
              <path 
                d="M130 300 L110 300 L115 370 L128 370 Q132 335 130 300" 
                fill="#4a4a4a"
              />
              
              {/* Feet */}
              <ellipse cx="78" cy="380" rx="12" ry="8" fill="#4a4a4a" />
              <ellipse cx="122" cy="380" rx="12" ry="8" fill="#4a4a4a" />
            </svg>
          </div>
        </div>

        {/* Back View */}
        <div className="space-y-3">
          <h3 className="text-center text-sm font-medium text-muted-foreground">Back</h3>
          <div className="relative aspect-[1/2] w-full max-w-[200px] mx-auto">
            <svg viewBox="0 0 200 400" className="w-full h-full">
              {/* Head */}
              <ellipse cx="100" cy="30" rx="25" ry="28" fill="#4a4a4a" />
              
              {/* Neck */}
              <rect x="90" y="55" width="20" height="15" fill="#4a4a4a" />
              
              {/* Traps (upper back) */}
              <path 
                d="M70 70 Q100 55 130 70 L125 100 Q100 95 75 100 Z" 
                fill={getMuscleColor('traps')} 
                opacity={getMuscleOpacity('traps')}
              />
              
              {/* Rear Deltoids */}
              <ellipse cx="60" cy="90" rx="15" ry="18" fill={getMuscleColor('rear-deltoid')} opacity={getMuscleOpacity('rear-deltoid')} />
              <ellipse cx="140" cy="90" rx="15" ry="18" fill={getMuscleColor('rear-deltoid')} opacity={getMuscleOpacity('rear-deltoid')} />
              
              {/* Lats */}
              <path 
                d="M70 100 L80 95 L80 140 L65 130 Q62 115 70 100" 
                fill={getMuscleColor('lats')} 
                opacity={getMuscleOpacity('lats')}
              />
              <path 
                d="M130 100 L120 95 L120 140 L135 130 Q138 115 130 100" 
                fill={getMuscleColor('lats')} 
                opacity={getMuscleOpacity('lats')}
              />
              
              {/* Mid back / Rhomboids */}
              <path 
                d="M80 95 L100 90 L120 95 L120 140 Q100 145 80 140 Z" 
                fill={getMuscleColor('lats')} 
                opacity={getMuscleOpacity('lats')}
              />
              
              {/* Triceps */}
              <ellipse cx="48" cy="125" rx="10" ry="28" fill={getMuscleColor('triceps')} opacity={getMuscleOpacity('triceps')} />
              <ellipse cx="152" cy="125" rx="10" ry="28" fill={getMuscleColor('triceps')} opacity={getMuscleOpacity('triceps')} />
              
              {/* Lower Back */}
              <path 
                d="M80 140 Q100 145 120 140 L118 180 Q100 185 82 180 Z" 
                fill={getMuscleColor('lower-back')} 
                opacity={getMuscleOpacity('lower-back')}
              />
              
              {/* Forearms */}
              <ellipse cx="45" cy="165" rx="8" ry="25" fill={getMuscleColor('forearms')} opacity={getMuscleOpacity('forearms')} />
              <ellipse cx="155" cy="165" rx="8" ry="25" fill={getMuscleColor('forearms')} opacity={getMuscleOpacity('forearms')} />
              
              {/* Hands */}
              <ellipse cx="42" cy="200" rx="8" ry="12" fill="#4a4a4a" />
              <ellipse cx="158" cy="200" rx="8" ry="12" fill="#4a4a4a" />
              
              {/* Glutes */}
              <ellipse cx="85" cy="200" rx="18" ry="20" fill={getMuscleColor('glutes')} opacity={getMuscleOpacity('glutes')} />
              <ellipse cx="115" cy="200" rx="18" ry="20" fill={getMuscleColor('glutes')} opacity={getMuscleOpacity('glutes')} />
              
              {/* Hamstrings */}
              <path 
                d="M70 220 L90 215 L90 285 L70 285 Q65 250 70 220" 
                fill={getMuscleColor('hamstrings')} 
                opacity={getMuscleOpacity('hamstrings')}
              />
              <path 
                d="M130 220 L110 215 L110 285 L130 285 Q135 250 130 220" 
                fill={getMuscleColor('hamstrings')} 
                opacity={getMuscleOpacity('hamstrings')}
              />
              
              {/* Knees */}
              <ellipse cx="80" cy="290" rx="12" ry="10" fill="#4a4a4a" />
              <ellipse cx="120" cy="290" rx="12" ry="10" fill="#4a4a4a" />
              
              {/* Calves */}
              <path 
                d="M68 300 L90 300 L88 340 Q78 355 70 340 Q66 320 68 300" 
                fill={getMuscleColor('calves')} 
                opacity={getMuscleOpacity('calves')}
              />
              <path 
                d="M132 300 L110 300 L112 340 Q122 355 130 340 Q134 320 132 300" 
                fill={getMuscleColor('calves')} 
                opacity={getMuscleOpacity('calves')}
              />
              
              {/* Lower calves */}
              <path 
                d="M70 340 L88 340 L85 370 L72 370 Z" 
                fill="#4a4a4a"
              />
              <path 
                d="M130 340 L112 340 L115 370 L128 370 Z" 
                fill="#4a4a4a"
              />
              
              {/* Feet */}
              <ellipse cx="78" cy="380" rx="12" ry="8" fill="#4a4a4a" />
              <ellipse cx="122" cy="380" rx="12" ry="8" fill="#4a4a4a" />
            </svg>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-xl bg-card border border-border/50 p-4">
        <h4 className="text-sm font-semibold mb-3">Recently Trained Muscles</h4>
        {trainedMuscles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No muscles trained in the last 3 days. Log a workout to see your activity!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {trainedMuscles.map(([muscle, daysAgo]) => (
              <div 
                key={muscle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getMuscleColor(muscle) }}
                />
                <span className="text-sm capitalize">{muscle.replace('-', ' ')}</span>
                <span className="text-xs text-muted-foreground">
                  {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1d ago' : `${daysAgo}d ago`}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Color scale */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Recovery Scale</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-primary via-primary/50 to-secondary" />
            <div className="flex justify-between text-xs text-muted-foreground w-full absolute left-0 right-0 px-4" style={{ position: 'relative' }}>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Just trained</span>
            <span>Recovering</span>
            <span>Recovered</span>
          </div>
        </div>
      </div>
    </div>
  )
}
