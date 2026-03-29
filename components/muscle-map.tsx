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
            <svg viewBox="0 0 200 420" className="w-full h-full">
              {/* Head */}
              <circle cx="100" cy="25" r="22" fill="#5a5a5a" />
              
              {/* Jawline */}
              <path d="M75 40 Q100 50 125 40" stroke="#4a4a4a" strokeWidth="2" fill="none" />
              
              {/* Neck */}
              <path d="M92 46 L95 65 L105 65 L108 46 Q100 48 92 46" fill="#5a5a5a" />
              
              {/* Clavicle/Shoulders outline */}
              <path d="M60 65 Q100 55 140 65" stroke="#4a4a4a" strokeWidth="1.5" fill="none" opacity="0.5" />
              
              {/* Traps */}
              <path 
                d="M75 65 L95 58 L105 58 L125 65 L115 85 Q100 88 85 85 Z" 
                fill={getMuscleColor('traps')} 
                opacity={getMuscleOpacity('traps')}
              />
              
              {/* Front Deltoids */}
              <path 
                d="M55 70 Q48 85 50 105 L65 100 Q62 82 60 70 Z" 
                fill={getMuscleColor('front-deltoid')} 
                opacity={getMuscleOpacity('front-deltoid')}
              />
              <path 
                d="M145 70 Q152 85 150 105 L135 100 Q138 82 140 70 Z" 
                fill={getMuscleColor('front-deltoid')} 
                opacity={getMuscleOpacity('front-deltoid')}
              />
              
              {/* Chest - Upper */}
              <path 
                d="M75 80 L100 75 L125 80 L125 105 Q100 115 75 105 Z" 
                fill={getMuscleColor('chest')} 
                opacity={getMuscleOpacity('chest')}
              />
              
              {/* Chest - Lower */}
              <path 
                d="M75 105 Q85 110 100 112 Q115 110 125 105 L125 135 Q100 142 75 135 Z" 
                fill={getMuscleColor('chest')} 
                opacity={getMuscleOpacity('chest')}
              />
              
              {/* Serratus (ribcage detail) */}
              <path 
                d="M128 115 L135 120 M128 130 L135 135 M128 145 L135 150" 
                stroke="#4a4a4a" strokeWidth="1" opacity="0.3"
              />
              <path 
                d="M72 115 L65 120 M72 130 L65 135 M72 145 L65 150" 
                stroke="#4a4a4a" strokeWidth="1" opacity="0.3"
              />
              
              {/* Arms - Upper Arms/Biceps */}
              <ellipse cx="52" cy="115" rx="13" ry="28" fill={getMuscleColor('biceps')} opacity={getMuscleOpacity('biceps')} />
              <ellipse cx="148" cy="115" rx="13" ry="28" fill={getMuscleColor('biceps')} opacity={getMuscleOpacity('biceps')} />
              
              {/* Abs - Upper */}
              <rect x="80" y="135" width="40" height="20" rx="3" fill={getMuscleColor('abs')} opacity={getMuscleOpacity('abs')} />
              
              {/* Abs - Middle */}
              <rect x="82" y="160" width="36" height="18" rx="3" fill={getMuscleColor('abs')} opacity={getMuscleOpacity('abs')} />
              
              {/* Abs - Lower */}
              <rect x="84" y="182" width="32" height="16" rx="3" fill={getMuscleColor('abs')} opacity={getMuscleOpacity('abs')} />
              
              {/* Ab lines for definition */}
              <line x1="100" y1="135" x2="100" y2="198" stroke="#3a3a3a" strokeWidth="1" opacity="0.6" />
              
              {/* Obliques */}
              <path 
                d="M75 140 L82 138 L85 200 L70 195 Q68 165 75 140" 
                fill={getMuscleColor('obliques')} 
                opacity={getMuscleOpacity('obliques')}
              />
              <path 
                d="M125 140 L118 138 L115 200 L130 195 Q132 165 125 140" 
                fill={getMuscleColor('obliques')} 
                opacity={getMuscleOpacity('obliques')}
              />
              
              {/* Forearms */}
              <ellipse cx="45" cy="155" rx="9" ry="28" fill={getMuscleColor('forearms')} opacity={getMuscleOpacity('forearms')} />
              <ellipse cx="155" cy="155" rx="9" ry="28" fill={getMuscleColor('forearms')} opacity={getMuscleOpacity('forearms')} />
              
              {/* Hands */}
              <rect x="38" y="188" width="14" height="20" rx="4" fill="#5a5a5a" />
              <rect x="148" y="188" width="14" height="20" rx="4" fill="#5a5a5a" />
              
              {/* Hip/Pelvis line */}
              <path d="M70 200 Q100 202 130 200" stroke="#4a4a4a" strokeWidth="1.5" fill="none" opacity="0.4" />
              
              {/* Quads - Outer (Vastus lateralis) */}
              <path 
                d="M70 210 L80 208 L85 295 L65 290 Q62 250 70 210" 
                fill={getMuscleColor('quads')} 
                opacity={getMuscleOpacity('quads')}
              />
              <path 
                d="M130 210 L120 208 L115 295 L135 290 Q138 250 130 210" 
                fill={getMuscleColor('quads')} 
                opacity={getMuscleOpacity('quads')}
              />
              
              {/* Quads - Center (Vastus medialis) */}
              <path 
                d="M80 210 L100 207 L105 295 L85 295 Z" 
                fill={getMuscleColor('quads')} 
                opacity={getMuscleOpacity('quads')}
              />
              <path 
                d="M120 210 L100 207 L95 295 L115 295 Z" 
                fill={getMuscleColor('quads')} 
                opacity={getMuscleOpacity('quads')}
              />
              
              {/* Quad definition line */}
              <line x1="100" y1="210" x2="100" y2="295" stroke="#3a3a3a" strokeWidth="1" opacity="0.6" />
              
              {/* Knees */}
              <ellipse cx="80" cy="305" rx="14" ry="12" fill="#5a5a5a" />
              <ellipse cx="120" cy="305" rx="14" ry="12" fill="#5a5a5a" />
              
              {/* Tibialis (front shin) */}
              <path 
                d="M68 315 L92 312 L88 395 L65 395 Q62 355 68 315" 
                fill="#4a4a4a"
              />
              <path 
                d="M132 315 L108 312 L112 395 L135 395 Q138 355 132 315" 
                fill="#4a4a4a"
              />
              
              {/* Feet */}
              <ellipse cx="75" cy="405" rx="13" ry="10" fill="#5a5a5a" />
              <ellipse cx="125" cy="405" rx="13" ry="10" fill="#5a5a5a" />
            </svg>
          </div>
        </div>

        {/* Back View */}
        <div className="space-y-3">
          <h3 className="text-center text-sm font-medium text-muted-foreground">Back</h3>
          <div className="relative aspect-[1/2] w-full max-w-[200px] mx-auto">
            <svg viewBox="0 0 200 420" className="w-full h-full">
              {/* Head */}
              <circle cx="100" cy="25" r="22" fill="#5a5a5a" />
              
              {/* Neck */}
              <path d="M92 46 L95 65 L105 65 L108 46 Q100 48 92 46" fill="#5a5a5a" />
              
              {/* Clavicle/Shoulders outline */}
              <path d="M60 65 Q100 55 140 65" stroke="#4a4a4a" strokeWidth="1.5" fill="none" opacity="0.5" />
              
              {/* Traps */}
              <path 
                d="M75 65 L95 58 L105 58 L125 65 L115 85 Q100 88 85 85 Z" 
                fill={getMuscleColor('traps')} 
                opacity={getMuscleOpacity('traps')}
              />
              
              {/* Rear Deltoids */}
              <path 
                d="M55 70 Q48 85 50 105 L65 100 Q62 82 60 70 Z" 
                fill={getMuscleColor('rear-deltoid')} 
                opacity={getMuscleOpacity('rear-deltoid')}
              />
              <path 
                d="M145 70 Q152 85 150 105 L135 100 Q138 82 140 70 Z" 
                fill={getMuscleColor('rear-deltoid')} 
                opacity={getMuscleOpacity('rear-deltoid')}
              />
              
              {/* Upper Back / Rhomboids */}
              <path 
                d="M78 85 L100 78 L122 85 L120 120 Q100 125 80 120 Z" 
                fill={getMuscleColor('lats')} 
                opacity={getMuscleOpacity('lats')}
              />
              
              {/* Lats - Upper Section */}
              <path 
                d="M70 100 L80 98 L90 115 L75 125 Q68 115 70 100" 
                fill={getMuscleColor('lats')} 
                opacity={getMuscleOpacity('lats')}
              />
              <path 
                d="M130 100 L120 98 L110 115 L125 125 Q132 115 130 100" 
                fill={getMuscleColor('lats')} 
                opacity={getMuscleOpacity('lats')}
              />
              
              {/* Lats - Lower Section */}
              <path 
                d="M68 125 L85 120 L95 185 L70 175 Q62 150 68 125" 
                fill={getMuscleColor('lats')} 
                opacity={getMuscleOpacity('lats')}
              />
              <path 
                d="M132 125 L115 120 L105 185 L130 175 Q138 150 132 125" 
                fill={getMuscleColor('lats')} 
                opacity={getMuscleOpacity('lats')}
              />
              
              {/* Lat definition line */}
              <line x1="100" y1="85" x2="100" y2="185" stroke="#3a3a3a" strokeWidth="1" opacity="0.6" />
              
              {/* Triceps */}
              <ellipse cx="52" cy="115" rx="13" ry="28" fill={getMuscleColor('triceps')} opacity={getMuscleOpacity('triceps')} />
              <ellipse cx="148" cy="115" rx="13" ry="28" fill={getMuscleColor('triceps')} opacity={getMuscleOpacity('triceps')} />
              
              {/* Lower Back */}
              <path 
                d="M82 180 Q100 185 118 180 L125 210 Q100 215 75 210 Z" 
                fill={getMuscleColor('lower-back')} 
                opacity={getMuscleOpacity('lower-back')}
              />
              
              {/* Forearms */}
              <ellipse cx="45" cy="155" rx="9" ry="28" fill={getMuscleColor('forearms')} opacity={getMuscleOpacity('forearms')} />
              <ellipse cx="155" cy="155" rx="9" ry="28" fill={getMuscleColor('forearms')} opacity={getMuscleOpacity('forearms')} />
              
              {/* Hands */}
              <rect x="38" y="188" width="14" height="20" rx="4" fill="#5a5a5a" />
              <rect x="148" y="188" width="14" height="20" rx="4" fill="#5a5a5a" />
              
              {/* Hip/Pelvis line */}
              <path d="M70 210 Q100 212 130 210" stroke="#4a4a4a" strokeWidth="1.5" fill="none" opacity="0.4" />
              
              {/* Glutes */}
              <ellipse cx="82" cy="225" rx="16" ry="22" fill={getMuscleColor('glutes')} opacity={getMuscleOpacity('glutes')} />
              <ellipse cx="118" cy="225" rx="16" ry="22" fill={getMuscleColor('glutes')} opacity={getMuscleOpacity('glutes')} />
              
              {/* Glute separation line */}
              <line x1="100" y1="210" x2="100" y2="245" stroke="#3a3a3a" strokeWidth="1" opacity="0.6" />
              
              {/* Hamstrings - Outer */}
              <path 
                d="M70 250 L82 248 L88 315 L65 310 Q62 280 70 250" 
                fill={getMuscleColor('hamstrings')} 
                opacity={getMuscleOpacity('hamstrings')}
              />
              <path 
                d="M130 250 L118 248 L112 315 L135 310 Q138 280 130 250" 
                fill={getMuscleColor('hamstrings')} 
                opacity={getMuscleOpacity('hamstrings')}
              />
              
              {/* Hamstrings - Center */}
              <path 
                d="M82 250 L100 248 L105 315 L88 315 Z" 
                fill={getMuscleColor('hamstrings')} 
                opacity={getMuscleOpacity('hamstrings')}
              />
              <path 
                d="M118 250 L100 248 L95 315 L112 315 Z" 
                fill={getMuscleColor('hamstrings')} 
                opacity={getMuscleOpacity('hamstrings')}
              />
              
              {/* Hamstring definition line */}
              <line x1="100" y1="250" x2="100" y2="315" stroke="#3a3a3a" strokeWidth="1" opacity="0.6" />
              
              {/* Knees */}
              <ellipse cx="80" cy="325" rx="14" ry="12" fill="#5a5a5a" />
              <ellipse cx="120" cy="325" rx="14" ry="12" fill="#5a5a5a" />
              
              {/* Calves */}
              <path 
                d="M68 335 L92 332 L88 395 L65 395 Q62 365 68 335" 
                fill={getMuscleColor('calves')} 
                opacity={getMuscleOpacity('calves')}
              />
              <path 
                d="M132 335 L108 332 L112 395 L135 395 Q138 365 132 335" 
                fill={getMuscleColor('calves')} 
                opacity={getMuscleOpacity('calves')}
              />
              
              {/* Feet */}
              <ellipse cx="75" cy="405" rx="13" ry="10" fill="#5a5a5a" />
              <ellipse cx="125" cy="405" rx="13" ry="10" fill="#5a5a5a" />
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
