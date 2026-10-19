'use client'

import React, { useEffect, useState } from 'react'
import {
  FolderGit2,
  MessageSquare,
  CheckCircle2,
  Layers,
  Server,
  AlertCircle
} from 'lucide-react'
import { MetricCard } from './metric-card'
import { apiClient } from '@/lib/api-client'

interface EngineeringOverviewProps {
  refreshKey?: number
  activeRepo?: string
}

export function EngineeringOverview({ refreshKey = 0, activeRepo: externalActiveRepo }: EngineeringOverviewProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    reposCount: 0,
    activeRepo: 'None',
    convsCount: 0,
    isConnected: false,
    githubUser: 'Not connected',
    backendOnline: false,
    backendVersion: '1.0.0',
  })

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const [ghStatus, convs, health] = await Promise.allSettled([
          apiClient.getGitHubStatus(),
          apiClient.getConversations(),
          apiClient.checkHealth(),
        ])

        if (!isMounted) return

        let reposCount = 0
        let isConnected = false
        let githubUser = 'Not connected'
        let activeRepo = externalActiveRepo || 'None'

        if (ghStatus.status === 'fulfilled' && ghStatus.value) {
          isConnected = Boolean(ghStatus.value.connected)
          githubUser = ghStatus.value.username || (isConnected ? 'Connected' : 'Not connected')
          if (!externalActiveRepo) {
            activeRepo = ghStatus.value.selected_repo || (typeof window !== 'undefined' ? localStorage.getItem('copilot_active_repo') || 'None' : 'None')
          }
        }

        let convsCount = 0
        if (convs.status === 'fulfilled' && Array.isArray(convs.value)) {
          convsCount = convs.value.length
        }

        const backendOnline = health.status === 'fulfilled' && health.value?.status !== 'offline'
        const backendVersion = health.status === 'fulfilled' ? health.value?.version || '1.0.0' : '1.0.0'

        if (isConnected) {
          try {
            const repoList = await apiClient.getGitHubRepositories(1, 100)
            if (repoList && Array.isArray(repoList.repositories)) {
              reposCount = repoList.repositories.length
            }
          } catch {
            reposCount = 0
          }
        }

        setStats({
          reposCount,
          activeRepo: activeRepo !== 'None' && activeRepo.includes('/') ? activeRepo.split('/')[1] : activeRepo,
          convsCount,
          isConnected,
          githubUser,
          backendOnline,
          backendVersion,
        })
      } catch {
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [refreshKey, externalActiveRepo])

  const repoTrendType: 'up' | 'down' | 'neutral' = stats.reposCount > 0 ? 'up' : 'neutral'
  const activeRepoTrendType: 'up' | 'down' | 'neutral' = stats.activeRepo !== 'None' ? 'up' : 'neutral'
  const chatTrendType: 'up' | 'down' | 'neutral' = stats.convsCount > 0 ? 'up' : 'neutral'
  const backendTrendType: 'up' | 'down' | 'neutral' = stats.backendOnline ? 'up' : 'down'

  const metrics = [
    {
      id: 'm1',
      label: 'Repositories',
      metric: loading ? '...' : String(stats.reposCount),
      trend: stats.isConnected ? `${stats.reposCount} accessible` : 'Connect GitHub in Integrations',
      trendType: repoTrendType,
      icon: FolderGit2,
    },
    {
      id: 'm2',
      label: 'Active Repository',
      metric: loading ? '...' : (stats.activeRepo === 'None' ? '—' : stats.activeRepo),
      trend: stats.activeRepo !== 'None' ? 'Selected context' : 'No repository selected',
      trendType: activeRepoTrendType,
      icon: Layers,
    },
    {
      id: 'm3',
      label: 'Saved Conversations',
      metric: loading ? '...' : String(stats.convsCount),
      trend: stats.convsCount > 0 ? `${stats.convsCount} persisted session(s)` : 'No conversations yet',
      trendType: chatTrendType,
      icon: MessageSquare,
    },
    {
      id: 'm4',
      label: 'Backend API Service',
      metric: loading ? '...' : (stats.backendOnline ? 'Healthy' : 'Offline'),
      trend: stats.backendOnline ? `FastAPI v${stats.backendVersion}` : 'Port 8000 unreachable',
      trendType: backendTrendType,
      icon: stats.backendOnline ? CheckCircle2 : Server,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Engineering Overview
        </h2>
        <span className="text-muted-foreground text-[10px] font-mono">Verified System Telemetry</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((item) => (
          <MetricCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  )
}
