'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleLogout}
      className="gap-2 text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sign Out</span>
    </Button>
  )
}
