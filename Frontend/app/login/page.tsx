import { Suspense } from 'react'
import { AuthPage } from '@/components/auth/auth-page'

export const metadata = {
  title: 'Sign In | AI Engineering Copilot',
  description: 'Sign in to access your engineering workspace and AI agents.',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <AuthPage />
    </Suspense>
  )
}
