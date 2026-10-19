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
  activeProject?: string
  activeRepo?: string
  onOpenProjects?: () => void
  onOpenRepos?: () => void
  onSelectRepo?: (repoName: string) => void
  onUpdateChatTitle?: (chatId: string, title: string) => void
  onSelectChat?: (chatId: string) => void
}

export function WorkspaceMain({
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  onOpenSettings,
  activeChatId,
  activeProject,
  activeRepo,
  onOpenProjects,
  onOpenRepos,
  onSelectRepo,
  onUpdateChatTitle,
  onSelectChat,
}: WorkspaceMainProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<string>('chat')
  const currentTab = externalActiveTab || internalActiveTab

  return (
    <main className="flex-1 h-full min-w-0 bg-background flex flex-col justify-between overflow-hidden relative">
      {/* Main Workspace Active View */}
      <div className="flex-1 overflow-y-auto h-full flex flex-col">
        {currentTab === 'dashboard' ? (
          <Dashboard
            activeRepo={activeRepo}
            onQuickAction={(actionId) => {
              if (!externalSetActiveTab) return
              if (actionId === 'ask-copilot' || actionId === 'explain-code') {
                externalSetActiveTab('chat')
              } else if (actionId === 'analyze-repo' || actionId === 'pr-review' || actionId === 'gen-tests') {
                externalSetActiveTab('agents')
              }
            }}
            onSelectRepo={(r) => {
              if (onSelectRepo) {
                onSelectRepo(r.name || r.full_name)
              } else if (externalSetActiveTab) {
                externalSetActiveTab('chat')
              }
            }}
            onSelectConversation={(chatId) => {
              if (onSelectChat) {
                onSelectChat(chatId)
              }
              if (externalSetActiveTab) {
                externalSetActiveTab('chat')
              }
            }}
            onOpenRepos={onOpenRepos}
            onNavigateTab={externalSetActiveTab}
          />
        ) : currentTab === 'agents' ? (
          <AgentsPage activeRepo={activeRepo} />
        ) : currentTab === 'repositories' ? (
          <RepositoryExplorer activeRepo={activeRepo} />
        ) : currentTab === 'integrations' ? (
          <IntegrationsPage />
        ) : currentTab === 'settings' ? (
          <SettingsPage initialSection="general" />
        ) : currentTab === 'personalization' ? (
          <SettingsPage initialSection="personalization" />
        ) : (
          <ChatWorkspace
            key={`${activeChatId || 'default'}_${activeRepo || 'default'}`}
            activeChatId={activeChatId}
            activeProject={activeProject}
            activeRepo={activeRepo}
            onOpenProjects={onOpenProjects}
            onOpenRepos={onOpenRepos}
            onOpenSettings={onOpenSettings}
            onUpdateChatTitle={onUpdateChatTitle}
            onSelectChat={onSelectChat}
          />
        )}
      </div>
    </main>
  )
}

