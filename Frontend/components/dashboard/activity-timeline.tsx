'use client'

import React, { useEffect, useState } from 'react'
import {
  MessageSquare,
  GitCommit,
  Clock,
  ArrowUpRight,
  FolderGit2
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export interface RealActivityItem {
  id: string
  source: 'Chat' | 'Git'
  title: string
  time: string
  detail?: string
  icon: React.ElementType
  color: string
  onClick?: () => void
}

interface ActivityTimelineProps {
  refreshKey?: number
  activeRepo?: string
  onSelectConversation?: (chatId: string) => void
}

export function ActivityTimeline({
  refreshKey = 0,
  activeRepo,
  onSelectConversation,
}: ActivityTimelineProps) {
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

        // 1. Real persisted chat conversations
        if (convsRes.status === 'fulfilled' && Array.isArray(convsRes.value)) {
          convsRes.value.slice(0, 4).forEach((conv: any) => {
            const chatId = String(conv.id)
            items.push({
              id: `conv-${chatId}`,
              source: 'Chat',
              title: conv.title ? conv.title : 'Engineering Chat Session',
              detail: conv.repo_name ? `Target: ${conv.repo_name}` : undefined,
              time: conv.updated_at
                ? new Date(conv.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Recent',
              icon: MessageSquare,
              color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
              onClick: onSelectConversation ? () => onSelectConversation(chatId) : undefined,
            })
          })
        }

        // 2. Real git commits from selected repository
        const targetRepo =
          activeRepo ||
          (ghStatus.status === 'fulfilled' && ghStatus.value?.selected_repo ? ghStatus.value.selected_repo : null) ||
          (typeof window !== 'undefined' ? localStorage.getItem('copilot_active_repo') || null : null)

        if (targetRepo && targetRepo.trim()) {
          try {
            const commitRes = await apiClient.fetchGitHubCommits(targetRepo, 'main', 3)
            if (isMounted && commitRes && Array.isArray(commitRes.commits)) {
              commitRes.commits.slice(0, 3).forEach((c: any) => {
                const firstLine = c.message ? c.message.split('\n')[0] : 'Commit'
                items.push({
                  id: `commit-${c.sha || Math.random()}`,
                  source: 'Git',
                  title: firstLine.length > 50 ? `${firstLine.substring(0, 48)}...` : firstLine,
                  detail: c.sha ? `${c.sha.substring(0, 7)} by ${c.author_name || 'author'}` : undefined,
                  time: c.author_date
                    ? new Date(c.author_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : 'Recent',
                  icon: GitCommit,
                  color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                })
              })
            }
          } catch {
            // Commit fetch error handled gracefully without breaking timeline
          }
        }

        setEvents(items)
      } catch {
        setEvents([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadActivity()

    return () => {
      isMounted = false
    }
  }, [refreshKey, activeRepo, onSelectConversation])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Engineering Activity
        </h2>
        <span className="text-muted-foreground text-[10px] font-mono">
          {events.length > 0 ? `${events.length} event(s)` : 'Live Stream'}
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border space-y-2 select-none shadow-xs">
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground font-mono">
            Loading activity stream...
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 px-4 text-center space-y-1.5">
            <Clock className="size-6 text-muted-foreground/60 mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              No recent activity recorded yet.
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              Start a conversation in Copilot Chat or select a connected repository to see activity here.
            </p>
          </div>
        ) : (
          events.map((event, idx) => {
            const Icon = event.icon
            const isClickable = Boolean(event.onClick)

            return (
              <div
                key={event.id}
                onClick={event.onClick}
                className={`flex items-start gap-3 p-2 rounded-xl transition-all ${
                  isClickable
                    ? 'cursor-pointer hover:bg-secondary/50 group'
                    : 'hover:bg-secondary/20'
                }`}
              >
                <div
                  className={`size-7 rounded-xl border ${event.color} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}
                >
                  <Icon className="size-3.5" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-muted-foreground font-mono text-[9px] bg-secondary px-1.5 py-0.5 rounded border border-border shrink-0">
                        {event.source}
                      </span>
                      <span className={`font-medium text-foreground truncate ${
                        isClickable ? 'group-hover:text-primary transition-colors' : ''
                      }`}>
                        {event.title}
                      </span>
                      {isClickable && (
                        <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      )}
                    </div>
                    {event.detail && (
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {event.detail}
                      </p>
                    )}
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
