'use client'

import React, { useState, useCallback } from 'react'
import { DashboardHeader } from './dashboard-header'
import { QuickActions } from './quick-actions'
import { EngineeringOverview } from './engineering-overview'
import { RecentRepositories } from './recent-repositories'
import { ActivityTimeline } from './activity-timeline'
import { RepositoryHealth } from './repository-health'

interface DashboardProps {
  activeRepo?: string
  onQuickAction?: (actionId: string) => void
  onSelectRepo?: (repo: any) => void
  onSelectConversation?: (chatId: string) => void
  onOpenRepos?: () => void
  onNavigateTab?: (tab: string) => void
}

export function Dashboard({
  activeRepo,
  onQuickAction,
  onSelectRepo,
  onSelectConversation,
  onOpenRepos,
  onNavigateTab,
}: DashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 antialiased select-none font-sans">
      {/* 1. Header (Greeting & Real System Health Status) */}
      <DashboardHeader onRefresh={handleRefresh} refreshKey={refreshKey} />

      {/* 2. Quick Actions (Genuine Workflows) */}
      <QuickActions
        activeRepo={activeRepo}
        onActionClick={onQuickAction}
        onOpenRepos={onOpenRepos}
      />

      {/* 3. Engineering Statistics Row (Accurate Metrics) */}
      <EngineeringOverview refreshKey={refreshKey} activeRepo={activeRepo} />

      {/* 4. Two-Column Workspace Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activity Timeline */}
        <div className="lg:col-span-7">
          <ActivityTimeline
            refreshKey={refreshKey}
            activeRepo={activeRepo}
            onSelectConversation={onSelectConversation}
          />
        </div>

        {/* Right Column: Repository Telemetry & Integration */}
        <div className="lg:col-span-5">
          <RepositoryHealth
            refreshKey={refreshKey}
            activeRepo={activeRepo}
            onOpenRepos={onOpenRepos}
            onNavigateIntegrations={() => onNavigateTab && onNavigateTab('integrations')}
          />
        </div>
      </div>

      {/* 5. Connected GitHub Repositories Table */}
      <RecentRepositories
        refreshKey={refreshKey}
        activeRepo={activeRepo}
        onSelectRepo={onSelectRepo}
        onViewAll={onOpenRepos}
      />
    </div>
  )
}
