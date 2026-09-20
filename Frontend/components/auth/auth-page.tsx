'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sparkles,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  AlertCircle
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { signIn } from 'next-auth/react'

export function AuthPage() {
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Auth Form States
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState(false)
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false)
  const [organizationDomain, setOrganizationDomain] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const isDark = (resolvedTheme || theme) === 'dark'
    setTheme(isDark ? 'light' : 'dark')
  }

  const currentTheme = mounted ? resolvedTheme || theme : 'dark'

  const [formError, setFormError] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  async function backendAuth(endpoint: 'login' | 'register', payload: Record<string, string>) {
    const res = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      let errorMsg = 'Authentication failed'
      if (body.detail) {
        if (typeof body.detail === 'string') {
          errorMsg = body.detail
        } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
          errorMsg = body.detail[0].msg
        }
      }
      throw new Error(errorMsg)
    }
    return res.json() as Promise<{ token: string; user: { id: number; full_name: string; email: string } }>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setFormError(null)
    try {
      const data = isSignUp
        ? await backendAuth('register', { full_name: email.split('@')[0], email, password })
        : await backendAuth('login', { email, password })

      // Only the server-issued token is trusted.
      localStorage.setItem('token', data.token)
      localStorage.setItem('user_token', data.token)
      localStorage.setItem('user_profile', JSON.stringify(data.user))
      localStorage.setItem('user', JSON.stringify(data.user))

      // Also sync with NextAuth Credentials Provider
      try {
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
      } catch {}

      setIsLoading(false)
      setAuthSuccess(true)
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } catch (err: any) {
      setIsLoading(false)
      setFormError(err.message || 'Invalid email or password')
    }
  }

  const handleEnterpriseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationDomain) return
    setShowEnterpriseModal(false)
    setFormError('Enterprise SSO (SAML / Okta) is not configured for domain: ' + organizationDomain)
  }

  const searchParams = useSearchParams()
  const authError = searchParams.get('error')

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary font-sans">
      {/* Background Decorative Atmosphere & Faint Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Radial Blue Glow in top-center */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-primary/5 blur-[160px] rounded-full" />

        {/* Faint Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Header Bar: System Status & Theme Switcher */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between">
        {/* Minimal Left Brand Icon for small screens */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground hidden sm:inline">
            AI Engineering Copilot
          </span>
        </div>

        {/* Top Right: System Status & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* System Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border shadow-xs text-xs backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <span className="text-muted-foreground text-[11px] font-medium hidden sm:inline">
              All systems operational
            </span>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-border shadow-xs transition-colors cursor-pointer"
          >
            {mounted && currentTheme === 'light' ? (
              <Moon className="size-4 text-foreground" />
            ) : (
              <Sun className="size-4 text-amber-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Centered Auth Container */}
      <main className="relative z-10 w-full max-w-md px-4 py-4 flex flex-col items-center justify-center my-auto">
        <div className="w-full bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-xl space-y-5">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-blue-600/30">
              <div className="size-full rounded-[14px] bg-card flex items-center justify-center text-primary">
                <Sparkles className="size-5" />
              </div>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {isSignUp ? 'Create your workspace' : 'AI Engineering Copilot'}
              </h1>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {isSignUp
                  ? 'Get started with autonomous AI code reviews and developer workflows.'
                  : 'Sign in to access your engineering workspace and AI agents.'}
              </p>
            </div>
          </div>

          {/* Auth Error Banner if redirected with ?error= */}
          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-semibold text-red-700 dark:text-red-200">
                  Authentication Failed ({authError})
                </div>
                <div className="text-[11px] text-muted-foreground leading-normal">
                  {authError === 'OAuthSignin' || authError === 'OAuthCallback' || authError === 'Configuration'
                    ? 'Google OAuth credentials are not configured in Frontend/.env.local yet. You can sign in using any Work Email below, or set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Frontend/.env.local.'
                    : 'An authentication error occurred. Please try again or sign in with your email.'}
                </div>
              </div>
            </div>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
              <div className="font-medium text-xs leading-normal">
                {formError}
              </div>
            </div>
          )}

          {/* Developer SSO Providers */}
          <div className="space-y-2">
            {/* GitHub SSO */}
            <button
              type="button"
              onClick={async () => {
                setSsoLoading('GitHub')
                setFormError(null)
                try {
                  const result = await signIn('github', {
                    callbackUrl: '/dashboard',
                    redirect: false,
                  })
                  if (result?.error) {
                    setFormError('GitHub sign in failed: ' + result.error)
                  } else if (result?.url) {
                    window.location.href = result.url
                  }
                } catch {
                  setFormError('Failed to initialize GitHub sign in.')
                } finally {
                  setSsoLoading(null)
                }
              }}
              disabled={isLoading || !!ssoLoading}
              className="w-full h-10 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer group"
            >
              {ssoLoading === 'GitHub' ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <svg className="size-4 fill-current text-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              <span>Continue with GitHub</span>
            </button>

            {/* Google SSO */}
            <button
              type="button"
              onClick={async () => {
                setSsoLoading('Google')
                setFormError(null)
                try {
                  const result = await signIn('google', {
                    callbackUrl: '/dashboard',
                    redirect: false,
                  })
                  if (result?.error) {
                    setFormError('Google sign in failed: ' + result.error)
                  } else if (result?.url) {
                    window.location.href = result.url
                  }
                } catch {
                  setFormError('Failed to initialize Google sign in.')
                } finally {
                  setSsoLoading(null)
                }
              }}
              disabled={isLoading || !!ssoLoading}
              className="w-full h-10 px-4 rounded-xl bg-secondary/70 hover:bg-secondary border border-border text-foreground font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {ssoLoading === 'Google' ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Enterprise SSO */}
            <button
              type="button"
              onClick={() => setShowEnterpriseModal(true)}
              disabled={isLoading || !!ssoLoading}
              className="w-full h-10 px-4 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-border text-muted-foreground hover:text-foreground font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <KeyRound className="size-3.5 text-primary" />
              <span>Enterprise SSO (SAML / Okta)</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-card px-3 text-[11px] text-muted-foreground font-medium tracking-tight">
              Or continue with work email
            </span>
          </div>

          {/* Work Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Work Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground block">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="size-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground block">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your work email.')}
                    className="text-[11px] text-primary hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading || authSuccess}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Authenticating secure session...</span>
                </>
              ) : authSuccess ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-300" />
                  <span>Authenticated! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Workspace' : 'Sign In'}</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Text within Card */}
          <div className="pt-1 text-center text-xs text-muted-foreground">
            {isSignUp ? (
              <span>
                Already have an engineering workspace?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:underline font-medium underline-offset-4 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have a team workspace?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:underline font-medium underline-offset-4 transition-colors cursor-pointer"
                >
                  Request Access / Sign Up
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Enterprise SSO Modal Dialog */}
      {showEnterpriseModal && (
        <div
          onClick={() => setShowEnterpriseModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 text-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Enterprise SSO Login</h3>
              </div>
              <button
                onClick={() => setShowEnterpriseModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Enter your corporate domain or IdP identity to route authentication through your enterprise SAML 2.0 / Okta provider.
            </p>

            <form onSubmit={handleEnterpriseSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-foreground text-xs font-medium">Company Domain / IdP</label>
                <input
                  type="text"
                  required
                  placeholder="acme-corp.okta.com"
                  value={organizationDomain}
                  onChange={(e) => setOrganizationDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground text-xs outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="size-4" />
                <span>Redirect to Identity Provider</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Page Bottom Footer */}
      <footer className="relative z-10 w-full py-5 text-center text-xs text-muted-foreground px-4">
        <p className="space-x-1.5 font-sans">
          <span>Protected by enterprise-grade 256-bit encryption</span>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
        </p>
      </footer>
    </div>
  )
}
