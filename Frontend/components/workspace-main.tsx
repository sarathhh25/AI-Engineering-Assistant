'use client'

import React, { useState } from 'react'
import { ChatWorkspace } from '@/components/chat/chat-workspace'
import { IntegrationsPage } from '@/components/integrations/integrations-page'
import { SettingsPage } from '@/components/settings/settings-page'

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
        {currentTab === 'integrations' ? (
          <IntegrationsPage />
        ) : currentTab === 'settings' || currentTab === 'personalization' ? (
          <SettingsPage initialSection="general" />
        ) : (
          <ChatWorkspace onOpenSettings={onOpenSettings} />
        )}
      </div>
    </main>
  )
}

