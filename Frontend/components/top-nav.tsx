'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Layers,
  FolderKanban,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export interface TopNavProps {
  onOpenSettings?: () => void
  activeTabTitle?: string
  activeProject?: string
  activeRepo?: string
  onOpenProjects?: () => void
}

export function TopNav({
  onOpenSettings,
  activeTabTitle = 'Conversational Workspace',
  activeProject,
  activeRepo,
  onOpenProjects,
}: TopNavProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle click outside for notifications popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationsOpen])

  const toggleTheme = () => {
    const isDark = (resolvedTheme || theme) === 'dark'
    setTheme(isDark ? 'light' : 'dark')
  }

  const currentTheme = mounted ? resolvedTheme || theme : 'dark'

  return (
    <header className="w-full shrink-0 flex flex-col z-20 select-none antialiased">
      {/* Clean Top Header Row for Center Workspace */}
      <div className="h-12 w-full border-b border-border/80 bg-background/95 backdrop-blur-md px-4 flex items-center justify-between gap-3 text-xs font-sans">
        {/* Left Section: Active View Indicator & Active Project Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-secondary/60 text-foreground font-medium text-xs border border-border/60">
            <Layers className="size-3.5 text-primary" />
            <span suppressHydrationWarning>{activeTabTitle}</span>
          </div>

          {activeProject && (
            <button
              onClick={onOpenProjects}
              title="Click to switch active project context"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-all text-xs font-medium cursor-pointer"
            >
              <FolderKanban className="size-3.5 text-primary" />
              <span className="font-semibold truncate max-w-[140px] sm:max-w-[200px]">{activeProject}</span>
              <ChevronDown className="size-3 opacity-60 shrink-0" />
            </button>
          )}
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
        </div>
      </div>
    </header>
  )
}
