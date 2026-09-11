'use client'

import React from 'react'
import {
  GitPullRequest,
  AlertCircle,
  GitCommit,
  ShieldCheck,
  Bot,
  FolderGit2
} from 'lucide-react'
import { MetricCard } from './metric-card'

const METRICS = [
  { id: 'm1', label: 'Pull Requests', metric: '12', trend: '+12% this week', trendType: 'up' as const, icon: GitPullRequest },
  { id: 'm2', label: 'Open Issues', metric: '28', trend: '-4% this week', trendType: 'down' as const, icon: AlertCircle },
  { id: 'm3', label: 'Commits Today', metric: '34', trend: '+8 today', trendType: 'up' as const, icon: GitCommit },
  { id: 'm4', label: 'Code Reviews', metric: '8', trend: '+3 today', trendType: 'up' as const, icon: ShieldCheck },
  { id: 'm5', label: 'AI Tasks', metric: '46', trend: '+18% this week', trendType: 'up' as const, icon: Bot },
  { id: 'm6', label: 'Repositories', metric: '6', trend: '+1 this month', trendType: 'neutral' as const, icon: FolderGit2 },
]

export function EngineeringOverview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Engineering Overview
        </h2>
        <span className="text-muted-foreground text-[10px] font-mono">Real-time Metrics</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRICS.map((item) => (
          <MetricCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  )
}
