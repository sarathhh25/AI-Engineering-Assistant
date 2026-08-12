'use client'

import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface MetricCardProps {
  id: string
  label: string
  metric: string
  trend: string
  trendType: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export function MetricCard({ label, metric, trend, trendType, icon: Icon }: MetricCardProps) {
  const isUp = trendType === 'up'
  const isDown = trendType === 'down'

  return (
    <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between space-y-2 group select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 font-medium truncate">{label}</span>
        <Icon className="size-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors shrink-0" />
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold font-mono text-zinc-100">{metric}</span>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-mono">
        {isUp && <TrendingUp className="size-3 text-emerald-400" />}
        {isDown && <TrendingDown className="size-3 text-amber-400" />}
        <span className={isUp ? 'text-emerald-400' : isDown ? 'text-amber-400' : 'text-zinc-500'}>
          {trend}
        </span>
      </div>
    </div>
  )
}
