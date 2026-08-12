'use client'

import React from 'react'
import { DashboardHeader } from './dashboard-header'
import { QuickActions } from './quick-actions'
import { EngineeringOverview } from './engineering-overview'
import { RecentRepositories } from './recent-repositories'
import { ActivityTimeline } from './activity-timeline'
import { RepositoryHealth } from './repository-health'

interface DashboardProps {
  onQuickAction?: (actionId: string) => void
  onOpenProject?: (project: any) => void
  onSelectConversation?: (chat: any) => void
  onSelectRepo?: (repo: any) => void
  aiCredits?: number
  deductCredits?: (amount?: number) => void
}

export function Dashboard({
  onQuickAction,
  onSelectRepo,
  aiCredits = 8450,
  deductCredits,
}: DashboardProps) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 antialiased select-none font-sans">
      {/* 1. Header (Greeting & Status) */}
      <DashboardHeader onRefresh={() => console.log('Dashboard refreshed')} />

      {/* 2. Quick AI Actions (2x2 Grid) */}
      <QuickActions onActionClick={onQuickAction} deductCredits={deductCredits} />

      {/* 3. Engineering Statistics Row */}
      <EngineeringOverview />

      {/* 4. Two-Column Workspace Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activity Timeline */}
        <div className="lg:col-span-7">
          <ActivityTimeline />
        </div>

        {/* Right Column: Developer Health */}
        <div className="lg:col-span-5">
          <RepositoryHealth />
        </div>
      </div>

      {/* 5. Recent Repositories */}
      <RecentRepositories onSelectRepo={onSelectRepo} />
    </div>
  )
}
