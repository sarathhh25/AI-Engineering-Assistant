'use client'

import React, { useState } from 'react'
import { ChatWorkspace } from '@/components/chat/chat-workspace'
import { IntegrationsPage } from '@/components/integrations/integrations-page'
import { SettingsPage } from '@/components/settings/settings-page'
import { Dashboard } from '@/components/dashboard'
import { AgentsPage } from '@/components/agents/agents-page'
import { RepositoryExplorer } from '@/components/repository/repository-explorer'

interface WorkspaceMainProps {
  activeTab?: string
  setActiveTab?: (tab: any) => void
  onOpenSettings?: () => void
  activeChatId?: string | null
}

export function WorkspaceMain({
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  onOpenSettings,
  activeChatId,
}: WorkspaceMainProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<string>('chat')
  const currentTab = externalActiveTab || internalActiveTab

  return (
    <main className="flex-1 h-full min-w-0 bg-background flex flex-col justify-between overflow-hidden relative">
      {/* Main Workspace Active View */}
      <div className="flex-1 overflow-y-auto h-full flex flex-col">
        {currentTab === 'dashboard' ? (
          <Dashboard
            onQuickAction={(actionId) => {
              if (actionId === 'ask-copilot' && externalSetActiveTab) {
                externalSetActiveTab('chat')
              }
            }}
          />
        ) : currentTab === 'agents' ? (
          <AgentsPage />
        ) : currentTab === 'repositories' ? (
          <RepositoryExplorer />
        ) : currentTab === 'integrations' ? (
          <IntegrationsPage />
        ) : currentTab === 'settings' ? (
          <SettingsPage initialSection="general" />
        ) : currentTab === 'personalization' ? (
          <SettingsPage initialSection="personalization" />
        ) : (
          <ChatWorkspace onOpenSettings={onOpenSettings} />
        )}
      </div>
    </main>
  )
}

