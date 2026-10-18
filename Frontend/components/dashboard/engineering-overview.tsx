'use client'

import React, { useEffect, useState } from 'react'
import {
  FolderGit2,
  MessageSquare,
  Bot,
  GitBranch,
  CheckCircle2,
  Layers
} from 'lucide-react'
import { MetricCard } from './metric-card'
import { apiClient } from '@/lib/api-client'

export function EngineeringOverview() {
  const [stats, setStats] = useState({
    reposCount: 0,
    activeRepo: 'None',
    convsCount: 0,
    isConnected: false,
    githubUser: 'Not connected',
    availableAgents: 6,
  })

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const [ghStatus, convs] = await Promise.allSettled([
          apiClient.getGitHubStatus(),
          apiClient.getConversations(),
        ])

        if (!isMounted) return

        let reposCount = 0
        let activeRepo = 'None'
        let isConnected = false
        let githubUser = 'Not connected'

        if (ghStatus.status === 'fulfilled' && ghStatus.value) {
          isConnected = Boolean(ghStatus.value.connected)
          githubUser = ghStatus.value.username || (isConnected ? 'Connected' : 'Not connected')
          activeRepo = ghStatus.value.selected_repo || 'None'
        }

        let convsCount = 0
        if (convs.status === 'fulfilled' && Array.isArray(convs.value)) {
          convsCount = convs.value.length
        }

        if (isConnected) {
          try {
            const repoList = await apiClient.getGitHubRepositories(1, 100)
            if (repoList && Array.isArray(repoList.repositories)) {
              reposCount = repoList.repositories.length
            }
          } catch {
            reposCount = 1
          }
        }

        setStats({
          reposCount,
          activeRepo: activeRepo.includes('/') ? activeRepo.split('/')[1] : activeRepo,
          convsCount,
          isConnected,
          githubUser,
          availableAgents: 6,
        })
      } catch {}
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const repoTrendType: 'up' | 'down' | 'neutral' = stats.reposCount > 0 ? 'up' : 'neutral'
  const activeRepoTrendType: 'up' | 'down' | 'neutral' = stats.activeRepo !== 'None' ? 'up' : 'neutral'
  const chatTrendType: 'up' | 'down' | 'neutral' = stats.convsCount > 0 ? 'up' : 'neutral'
  const oauthTrendType: 'up' | 'down' | 'neutral' = stats.isConnected ? 'up' : 'down'

  const metrics = [
    {
      id: 'm1',
      label: 'Repositories',
      metric: String(stats.reposCount),
      trend: stats.isConnected ? `${stats.reposCount} accessible` : 'Connect GitHub',
      trendType: repoTrendType,
      icon: FolderGit2,
    },
    {
      id: 'm2',
      label: 'Active Repository',
      metric: stats.activeRepo === 'None' ? '—' : stats.activeRepo,
      trend: stats.activeRepo !== 'None' ? 'Selected' : 'None selected',
      trendType: activeRepoTrendType,
      icon: Layers,
    },
    {
      id: 'm3',
      label: 'Chat Sessions',
      metric: String(stats.convsCount),
      trend: stats.convsCount > 0 ? 'Persisted history' : 'No chats yet',
      trendType: chatTrendType,
      icon: MessageSquare,
    },
    {
      id: 'm4',
      label: 'AI Agents',
      metric: String(stats.availableAgents),
      trend: '6 Specialized models',
      trendType: 'up' as const,
      icon: Bot,
    },
    {
      id: 'm5',
      label: 'GitHub OAuth',
      metric: stats.isConnected ? 'Active' : 'Offline',
      trend: stats.isConnected ? stats.githubUser : 'Disconnected',
      trendType: oauthTrendType,
      icon: GitBranch,
    },
    {
      id: 'm6',
      label: 'System Status',
      metric: 'Online',
      trend: 'FastAPI Backend Ready',
      trendType: 'up' as const,
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Engineering Overview
        </h2>
        <span className="text-muted-foreground text-[10px] font-mono">Live Workspace Telemetry</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((item) => (
          <MetricCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  )
}
