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
  { id: 'e1', source: 'GitHub', text: 'Sarath opened PR #142', time: '2 minutes ago', icon: GitPullRequest, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'e2', source: 'Copilot', text: 'Generated unit tests for auth service', time: '18 minutes ago', icon: Sparkles, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'e3', source: 'GitHub', text: 'PR #138 was merged to main', time: '42 minutes ago', icon: GitMerge, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'e4', source: 'Jira', text: 'PROJ-241 moved to In Progress', time: '1 hour ago', icon: Kanban, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'e5', source: 'Copilot', text: 'Completed repository architecture analysis', time: '2 hours ago', icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
]

export function ActivityTimeline() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
          Engineering Activity
        </h2>
        <span className="text-zinc-500 text-[10px]">Real-time Feed</span>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] space-y-3 select-none">
        {EVENTS.map((event, idx) => {
          const Icon = event.icon
          const isLast = idx === EVENTS.length - 1

          return (
            <div key={event.id} className="relative flex items-start gap-3 group">
              {/* Connector line */}
              {!isLast && (
                <span className="absolute left-3.5 top-7 bottom-0 w-px bg-white/10 group-hover:bg-white/20 transition-colors" />
              )}

              {/* Event Icon Badge */}
              <div className={`size-7 rounded-lg border ${event.color} flex items-center justify-center shrink-0 z-10 shadow-sm`}>
                <Icon className="size-3.5" />
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-zinc-400 font-mono text-[10px] bg-zinc-800/80 px-1.5 py-0.2 rounded border border-white/5">
                    {event.source}
                  </span>
                  <span className="text-zinc-200 font-medium group-hover:text-blue-400 transition-colors truncate">
                    {event.text}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono shrink-0">
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
