'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Dumbbell, Mail, Lock, User, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || undefined,
            },
          },
        })

        if (error) throw error

        toast.success('Account created! Please check your email to verify your account.')
        setIsSignUp(false)
        setEmail('')
        setPassword('')
        setName('')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center glow">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">GYMTRACK</span>
          </div>
          
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-display font-bold leading-tight">
                Transform your
                <br />
                <span className="text-gradient">fitness journey</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-md">
                Track workouts, crush goals, and become your strongest self with the most intuitive gym companion.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 max-w-md">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Quick Logging</p>
                  <p className="text-sm text-muted-foreground">Log workouts in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold">Goal Tracking</p>
                  <p className="text-sm text-muted-foreground">Stay consistent with streaks</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Progress Insights</p>
                  <p className="text-sm text-muted-foreground">Visualize your gains</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Join thousands of athletes tracking their progress
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center glow">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">GYMTRACK</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-display font-bold">
              {isSignUp ? 'Start your journey' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isSignUp
                ? 'Create an account to track your workouts'
                : 'Sign in to continue your progress'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold gap-2 glow" 
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setEmail('')
                setPassword('')
                setName('')
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp
                ? 'Already have an account? '
                : "Don't have an account? "}
              <span className="text-primary font-semibold hover:underline">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
