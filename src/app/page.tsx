import { getUserWithRole } from '@/utils/supabase/auth'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const userWithRole = await getUserWithRole()

  if (!userWithRole) {
    redirect('/login')
  }

  if (userWithRole.role === 'client') {
    redirect('/portal')
  }

  // admin and employee both go to dashboard
  redirect('/dashboard')
}
