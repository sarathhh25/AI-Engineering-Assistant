'use client'

import React, { useEffect, useState } from 'react'
import {
  MessageSquare,
  GitCommit,
  Clock,
  Sparkles,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export interface RealActivityItem {
  id: string
  source: 'Chat' | 'Git' | 'Copilot'
  title: string
  time: string
  icon: React.ElementType
  color: string
}

export function ActivityTimeline() {
  const [events, setEvents] = useState<RealActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadActivity = async () => {
      try {
        const [convsRes, ghStatus] = await Promise.allSettled([
          apiClient.getConversations(),
          apiClient.getGitHubStatus(),
        ])

        if (!isMounted) return

        const items: RealActivityItem[] = []

        if (convsRes.status === 'fulfilled' && Array.isArray(convsRes.value)) {
          convsRes.value.slice(0, 4).forEach((conv: any) => {
            items.push({
              id: `conv-${conv.id}`,
              source: 'Chat',
              title: conv.title ? `Session: "${conv.title}"` : 'New Chat Session',
              time: conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : 'Recent',
              icon: MessageSquare,
              color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            })
          })
        }

        const selectedRepo =
          ghStatus.status === 'fulfilled' && ghStatus.value?.selected_repo
            ? ghStatus.value.selected_repo
            : (typeof window !== 'undefined' ? localStorage.getItem('copilot_active_repo') || '' : '')

        if (selectedRepo && selectedRepo.trim()) {
          try {
            const commitRes = await apiClient.fetchGitHubCommits(selectedRepo, 'main', 3)
            if (commitRes && Array.isArray(commitRes.commits)) {
              commitRes.commits.slice(0, 3).forEach((c: any) => {
                items.push({
                  id: `commit-${c.sha || Math.random()}`,
                  source: 'Git',
                  title: c.message ? c.message.split('\n')[0] : 'Repository commit',
                  time: c.author_date ? new Date(c.author_date).toLocaleDateString() : 'Recent',
                  icon: GitCommit,
                  color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                })
              })
            }
          } catch {}
        }

        if (items.length === 0) {
          items.push({
            id: 'init-1',
            source: 'Copilot',
            title: 'AI Engineering Assistant initialized and ready for repository analysis.',
            time: 'Just now',
            icon: Sparkles,
            color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
          })
        }

        setEvents(items)
      } catch {
        setEvents([
          {
            id: 'init-fallback',
            source: 'Copilot',
            title: 'AI Engineering Assistant engine ready.',
            time: 'Online',
            icon: Sparkles,
            color: 'text-primary bg-primary/10 border-primary/20',
          },
        ])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadActivity()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Engineering Activity
        </h2>
        <span className="text-muted-foreground text-[10px] font-mono">Live Timeline</span>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border space-y-3 select-none shadow-xs">
        {loading ? (
          <div className="py-6 text-center text-xs text-muted-foreground font-mono">
            Loading activity stream...
          </div>
        ) : (
          events.map((event, idx) => {
            const Icon = event.icon
            const isLast = idx === events.length - 1

            return (
              <div key={event.id} className="relative flex items-start gap-3 group">
                {!isLast && (
                  <span className="absolute left-3.5 top-7 bottom-0 w-px bg-border group-hover:bg-primary/30 transition-colors" />
                )}

                <div
                  className={`size-7 rounded-xl border ${event.color} flex items-center justify-center shrink-0 z-10 shadow-2xs`}
                >
                  <Icon className="size-3.5" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-muted-foreground font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border">
                      {event.source}
                    </span>
                    <span className="text-foreground font-medium group-hover:text-primary transition-colors truncate">
                      {event.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono shrink-0">
                    <Clock className="size-2.5" />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
