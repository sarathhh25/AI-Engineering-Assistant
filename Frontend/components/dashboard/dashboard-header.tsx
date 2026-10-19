'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Calendar, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { useUserProfile } from '@/lib/use-user-profile'
import { apiClient } from '@/lib/api-client'

interface DashboardHeaderProps {
  onRefresh?: () => void
  refreshKey?: number
}

export function DashboardHeader({ onRefresh, refreshKey = 0 }: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const userProfile = useUserProfile()
  const userName = userProfile.name || 'Engineer'

  const [healthStatus, setHealthStatus] = useState<{
    backendOnline: boolean
    githubConnected: boolean
    githubUser: string | null
    loading: boolean
  }>({
    backendOnline: false,
    githubConnected: false,
    githubUser: null,
    loading: true,
  })

  // Dynamic time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  useEffect(() => {
    let isMounted = true

    const checkSystem = async () => {
      try {
        const [health, gh] = await Promise.allSettled([
          apiClient.checkHealth(),
          apiClient.getGitHubStatus(),
        ])
        if (!isMounted) return

        const backendOnline = health.status === 'fulfilled' && health.value?.status !== 'offline'
        const githubConnected = gh.status === 'fulfilled' && Boolean(gh.value?.connected)
        const githubUser = gh.status === 'fulfilled' ? gh.value?.username || null : null

        setHealthStatus({
          backendOnline,
          githubConnected,
          githubUser,
          loading: false,
        })
      } catch {
        if (isMounted) {
          setHealthStatus({
            backendOnline: false,
            githubConnected: false,
            githubUser: null,
            loading: false,
          })
        }
      }
    }

    checkSystem()
    return () => {
      isMounted = false
    }
  }, [refreshKey])

  const handleRefreshClick = () => {
    setIsRefreshing(true)
    if (onRefresh) onRefresh()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border select-none">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {getGreeting()}, {userName} <span className="inline-block">👋</span>
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time telemetry and shortcuts for your active engineering workspace.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 text-xs">
        {/* Genuine Workspace status indicator derived from real health checks */}
        {healthStatus.loading ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground text-[11px] font-medium">
            <Loader2 className="size-3 animate-spin text-primary" />
            <span>Checking workspace...</span>
          </div>
        ) : !healthStatus.backendOnline ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-medium">
            <span className="size-1.5 rounded-full bg-destructive animate-ping" />
            <span>Backend service offline</span>
          </div>
        ) : !healthStatus.githubConnected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>Backend ready • GitHub disconnected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        )}

        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border text-muted-foreground text-[11px]">
          <Calendar className="size-3 text-muted-foreground" />
          <span className="font-mono">{currentDate}</span>
        </div>

        {/* Real Refresh Button */}
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all disabled:opacity-50 cursor-pointer"
          title="Refresh Dashboard Data"
        >
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>
    </div>
  )
}
