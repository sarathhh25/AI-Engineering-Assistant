'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  Sliders,
  LogOut,
  ChevronDown,
  Activity,
  Layers
} from 'lucide-react'
import { useTheme } from 'next-themes'

export interface TopNavProps {
  onOpenSettings?: () => void
  activeTabTitle?: string
}

export function TopNav({
  onOpenSettings,
  activeTabTitle = 'Conversational Workspace',
}: TopNavProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const [userProfile, setUserProfile] = useState<{
    name: string
    email: string
    initials: string
  }>({
    name: 'Alex Kim',
    email: 'alex.kim@company.com',
    initials: 'AK',
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_profile') || localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        const name = parsed.name || parsed.fullName || 'Alex Kim'
        const email = parsed.email || 'alex.kim@company.com'
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'AK'

        setUserProfile({ name, email, initials })
      }
    } catch (e) {
      console.error('Error reading user profile in TopNav:', e)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_profile')
    localStorage.removeItem('user')
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/login'
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle click outside for notifications and profile popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (notificationsOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationsOpen, profileOpen])

  const toggleTheme = () => {
    const isDark = (resolvedTheme || theme) === 'dark'
    setTheme(isDark ? 'light' : 'dark')
  }

  const currentTheme = mounted ? resolvedTheme || theme : 'dark'

  return (
    <header className="w-full shrink-0 flex flex-col z-20 select-none antialiased">
      {/* Clean Top Header Row for Center Workspace */}
      <div className="h-12 w-full border-b border-border/80 bg-background/95 backdrop-blur-md px-4 flex items-center justify-between gap-3 text-xs font-sans">
        {/* Left Section: Active View Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-secondary/60 text-foreground font-medium text-xs border border-border/60">
            <Layers className="size-3.5 text-primary" />
            <span>{activeTabTitle}</span>
          </div>
        </div>

        {/* Right Section: System Status, Theme Switcher, Notifications & User Menu */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Live System Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] font-medium text-foreground">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <span className="text-muted-foreground hidden md:inline">All systems operational</span>
          </div>

          {/* Theme Switcher (Light / Dark Mode) */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border/60 cursor-pointer"
          >
            {mounted && currentTheme === 'light' ? (
              <Moon className="size-4 text-zinc-700" />
            ) : (
              <Sun className="size-4 text-amber-400" />
            )}
          </button>

          {/* Notifications Button & Popover with Outside Click Ref */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotificationsOpen((prev) => !prev)
                setProfileOpen(false)
              }}
              title="Notifications"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors relative border border-border/60 cursor-pointer"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-blue-500 ring-2 ring-background" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-popover p-3 shadow-2xl text-xs z-50 animate-in fade-in duration-100 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                  <span className="font-semibold text-foreground">Notifications</span>
                  <span className="text-[10px] text-muted-foreground font-mono">3 unread</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer space-y-0.5">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-medium text-[11px]">
                      <CheckCircle2 className="size-3.5" />
                      <span>PR #42 Risk Scan Completed</span>
                    </div>
                    <p className="text-muted-foreground text-[10px]">No regressions detected in auth pipeline.</p>
                  </div>

                  <div className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer space-y-0.5">
                    <div className="flex items-center gap-1.5 text-blue-500 font-medium text-[11px]">
                      <ShieldCheck className="size-3.5" />
                      <span>FastAPI Backend Ready</span>
                    </div>
                    <p className="text-muted-foreground text-[10px]">Connected to local engineering backend.</p>
                  </div>

                  <div className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer space-y-0.5">
                    <div className="flex items-center gap-1.5 text-amber-500 font-medium text-[11px]">
                      <Clock className="size-3.5" />
                      <span>Sprint Velocity Forecast Updated</span>
                    </div>
                    <p className="text-muted-foreground text-[10px]">Estimated delivery on schedule.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

          {/* User Profile Menu with Outside Click Ref */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen((prev) => !prev)
                setNotificationsOpen(false)
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-secondary/80 transition-colors border border-border/60 cursor-pointer"
            >
              <div className="size-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
                {userProfile.initials}
              </div>
              <span className="font-medium text-foreground hidden sm:inline text-xs">{userProfile.name}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-popover p-1.5 shadow-2xl text-xs z-50 animate-in fade-in duration-100 space-y-1 backdrop-blur-xl">
                <div className="p-2 border-b border-border space-y-0.5">
                  <div className="font-semibold text-foreground">{userProfile.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">{userProfile.email}</div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenSettings) onOpenSettings()
                    setProfileOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-secondary text-foreground flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sliders className="size-3.5 text-muted-foreground" />
                  <span>Settings & Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false)
                    handleLogout()
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
