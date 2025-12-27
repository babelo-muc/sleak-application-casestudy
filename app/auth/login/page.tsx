// app/auth/login/page.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/data-access/auth'
import { LoginForm } from './LoginForm'

export default async function LoginPage() {
  const user = await getCurrentUser()

  // Already signed in
  if (user) redirect('/')

  return <LoginForm />
}
