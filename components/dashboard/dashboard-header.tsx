'use client'

import React, { useState } from 'react'
import { RefreshCw, Calendar, CheckCircle2 } from 'lucide-react'

interface DashboardHeaderProps {
  onRefresh?: () => void
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const handleRefreshClick = () => {
    setIsRefreshing(true)
    if (onRefresh) onRefresh()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] select-none">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Good evening, Sarath <span className="animate-bounce inline-block">👋</span>
        </h1>
        <p className="text-xs text-zinc-400">
          Here&apos;s what&apos;s happening across your engineering workspace.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 text-xs">
        {/* Workspace status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>All systems operational</span>
        </div>

        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-400 text-[11px]">
          <Calendar className="size-3 text-zinc-500" />
          <span className="font-mono">{currentDate}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white transition-all disabled:opacity-50"
          title="Refresh Dashboard Data"
        >
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>
    </div>
  )
}
