'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface UserProfile {
  name: string
  email: string
  initials: string
  image?: string | null
}

export function useUserProfile(): UserProfile {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Developer',
    email: 'developer@company.com',
    initials: 'D',
    image: null,
  })

  useEffect(() => {
    try {
      // 1. Check NextAuth session first (for Google / OAuth login)
      if (session?.user) {
        const name = session.user.name || (session.user.email ? session.user.email.split('@')[0] : 'Developer')
        const email = session.user.email || 'developer@company.com'
        const initials = name
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'D'
        const image = session.user.image || null

        setProfile({ name, email, initials, image })

        // Persist to localStorage for fallback synchronization
        localStorage.setItem(
          'user_profile',
          JSON.stringify({ name, email, initials, image })
        )
        return
      }

      // 2. Check localStorage (for email/password or custom login)
      const stored = localStorage.getItem('user_profile') || localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        const name = parsed.name || parsed.fullName || (parsed.email ? parsed.email.split('@')[0] : 'Developer')
        const email = parsed.email || 'developer@company.com'
        const initials = name
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'D'
        const image = parsed.image || null

        setProfile({ name, email, initials, image })
      }
    } catch (e) {
      console.error('Error in useUserProfile hook:', e)
    }
  }, [session])

  return profile
}
