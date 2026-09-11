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
    <div className="p-3.5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-secondary/30 transition-all flex flex-col justify-between space-y-2 group select-none shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-medium truncate">{label}</span>
        <Icon className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold font-mono text-foreground">{metric}</span>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-mono">
        {isUp && <TrendingUp className="size-3 text-emerald-500" />}
        {isDown && <TrendingDown className="size-3 text-amber-500" />}
        <span className={isUp ? 'text-emerald-600 dark:text-emerald-400 font-medium' : isDown ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}>
          {trend}
        </span>
      </div>
    </div>
  )
}
