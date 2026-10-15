import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api-client'

export interface UserProfile {
  isAuthenticated: boolean
  name: string
  email: string
  initials: string
  image?: string | null
  backendToken?: string | null
}

export function useUserProfile(): UserProfile {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile>({
    isAuthenticated: false,
    name: '',
    email: '',
    initials: '',
    image: null,
    backendToken: null,
  })

  useEffect(() => {
    try {
      // 1. Check NextAuth session first
      if (session?.user) {
        const name = session.user.name || (session.user.email ? session.user.email.split('@')[0] : 'User')
        const email = session.user.email || ''
        const initials = name
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'U'
        const image = session.user.image || null
        const backendToken = (session as any).backendToken || (session.user as any)?.backendToken || null

        if (backendToken) {
          apiClient.setToken(backendToken)
        }

        const newProfile: UserProfile = {
          isAuthenticated: true,
          name,
          email,
          initials,
          image,
          backendToken,
        }

        setProfile(newProfile)

        if (typeof window !== 'undefined') {
          localStorage.setItem('user_profile', JSON.stringify({ name, email, initials, image }))
        }
        return
      }

      // 2. Check localStorage (for email/password or custom login)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('user_token')
        const stored = localStorage.getItem('user_profile') || localStorage.getItem('user')
        if (token && stored) {
          const parsed = JSON.parse(stored)
          const name = parsed.name || parsed.fullName || (parsed.email ? parsed.email.split('@')[0] : 'User')
          const email = parsed.email || ''
          const initials = name
            .split(' ')
            .filter(Boolean)
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'U'
          const image = parsed.image || null

          apiClient.setToken(token)

          setProfile({
            isAuthenticated: true,
            name,
            email,
            initials,
            image,
            backendToken: token,
          })
          return
        }
      }

      // 3. Unauthenticated state
      if (status !== 'loading') {
        setProfile({
          isAuthenticated: false,
          name: '',
          email: '',
          initials: '',
          image: null,
          backendToken: null,
        })
      }
    } catch (e) {
      console.error('Error in useUserProfile hook:', e)
    }
  }, [session, status])

  return profile
}
