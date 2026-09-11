'use client'

import React from 'react'
import {
  GitPullRequest,
  Sparkles,
  GitMerge,
  Kanban,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react'

export interface ActivityEvent {
  id: string
  source: 'GitHub' | 'Copilot' | 'Jira' | 'Deployment'
  text: string
  time: string
  icon: React.ElementType
  color: string
}

const EVENTS: ActivityEvent[] = [
  { id: 'e1', source: 'GitHub', text: 'Sarath opened PR #142', time: '2 minutes ago', icon: GitPullRequest, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { id: 'e2', source: 'Copilot', text: 'Generated unit tests for auth service', time: '18 minutes ago', icon: Sparkles, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { id: 'e3', source: 'GitHub', text: 'PR #138 was merged to main', time: '42 minutes ago', icon: GitMerge, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'e4', source: 'Jira', text: 'PROJ-241 moved to In Progress', time: '1 hour ago', icon: Kanban, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  { id: 'e5', source: 'Copilot', text: 'Completed repository architecture analysis', time: '2 hours ago', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
]

export function ActivityTimeline() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Engineering Activity
        </h2>
        <span className="text-muted-foreground text-[10px] font-mono">Real-time Feed</span>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border space-y-3 select-none shadow-xs">
        {EVENTS.map((event, idx) => {
          const Icon = event.icon
          const isLast = idx === EVENTS.length - 1

          return (
            <div key={event.id} className="relative flex items-start gap-3 group">
              {/* Connector line */}
              {!isLast && (
                <span className="absolute left-3.5 top-7 bottom-0 w-px bg-border group-hover:bg-primary/30 transition-colors" />
              )}

              {/* Event Icon Badge */}
              <div className={`size-7 rounded-xl border ${event.color} flex items-center justify-center shrink-0 z-10 shadow-2xs`}>
                <Icon className="size-3.5" />
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground font-mono text-[10px] bg-secondary px-1.5 py-0.2 rounded border border-border">
                    {event.source}
                  </span>
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors truncate">
                    {event.text}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono shrink-0">
                  <Clock className="size-2.5" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
