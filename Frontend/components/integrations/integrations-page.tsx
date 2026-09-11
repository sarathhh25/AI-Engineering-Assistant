'use client'

import React, { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import {
  GitPullRequest,
  Plug
} from 'lucide-react'

import { IntegrationSearch } from './integration-search'
import { IntegrationFilters, IntegrationFilterType } from './integration-filters'
import { IntegrationCard, IntegrationTool } from './integration-card'
import { IntegrationModal } from './integration-modal'
import { IntegrationSettingsModal } from './integration-settings-modal'
import { ConnectionState } from './connection-status'

const INITIAL_TOOLS: IntegrationTool[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync repositories, pull requests, issues, commits, and code reviews.',
    icon: GitPullRequest,
    status: 'Disconnected',
    scopes: ['Repository access', 'Pull requests', 'Issues', 'Commits', 'Branches'],
  },
]

export function IntegrationsPage() {
  const { data: session } = useSession()
  const isGithubConnected = !!(session as any)?.accessToken

  const [tools, setTools] = useState<IntegrationTool[]>(INITIAL_TOOLS)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<IntegrationFilterType>('all')
  const [selectedModalTool, setSelectedModalTool] = useState<IntegrationTool | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsTool, setSettingsTool] = useState<IntegrationTool | null>(null)

  // Load connection states from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('copilot_integrations_v2')
      if (savedState) {
        const parsed: Record<string, ConnectionState> = JSON.parse(savedState)
        setTools((prev) =>
          prev.map((t) => (parsed[t.id] ? { ...t, status: parsed[t.id] } : t))
        )
      }
    } catch (e) {}
  }, [])

  const saveToolStates = (updatedTools: IntegrationTool[]) => {
    setTools(updatedTools)
    try {
      const map: Record<string, ConnectionState> = {}
      updatedTools.forEach((t) => {
        map[t.id] = t.status
      })
      localStorage.setItem('copilot_integrations_v2', JSON.stringify(map))
    } catch (e) {}
  }

  const handleConnectClick = (tool: IntegrationTool) => {
    if (tool.id === 'github') {
      signIn('github')
      return
    }
    setSelectedModalTool(tool)
    setModalOpen(true)
  }

  const handleConfirmConnect = (toolId: string) => {
    const updated = tools.map((t) =>
      t.id === toolId ? { ...t, status: 'Connecting' as ConnectionState } : t
    )
    setTools(updated)

    setTimeout(() => {
      setTools((prev) => {
        const finalTools = prev.map((t) =>
          t.id === toolId ? { ...t, status: 'Connected' as ConnectionState } : t
        )
        try {
          const map: Record<string, ConnectionState> = {}
          finalTools.forEach((t) => {
            map[t.id] = t.status
          })
          localStorage.setItem('copilot_integrations_v2', JSON.stringify(map))
        } catch (e) {}
        return finalTools
      })
    }, 600)
  }

  const handleDisconnect = (toolId: string) => {
    const updated = tools.map((t) =>
      t.id === toolId ? { ...t, status: 'Disconnected' as ConnectionState } : t
    )
    saveToolStates(updated)
  }

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    const isConnected = tool.id === 'github' ? isGithubConnected : tool.status === 'Connected'

    if (filter === 'connected') return isConnected
    if (filter === 'available') return !isConnected
    return true
  })

  const connectedCount = tools.filter((t) =>
    t.id === 'github' ? isGithubConnected : t.status === 'Connected'
  ).length

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 select-none antialiased">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Plug className="size-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Integrations Hub
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Connect engineering services and configure synchronization options for your workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {connectedCount} Tools Connected
          </span>
        </div>
      </div>

      {/* Controls Row: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <IntegrationSearch value={search} onChange={setSearch} />
        <IntegrationFilters
          activeFilter={filter}
          onSelectFilter={setFilter}
          connectedCount={connectedCount}
          totalCount={tools.length}
        />
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <IntegrationCard
            key={tool.id}
            tool={tool}
            isGithubConnected={isGithubConnected}
            onConnectClick={handleConnectClick}
            onDisconnectClick={handleDisconnect}
            onOpenSettings={(t) => setSettingsTool(t)}
          />
        ))}
      </div>

      {/* Connection Modal Dialog */}
      <IntegrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirmConnect={handleConfirmConnect}
        tool={selectedModalTool}
      />

      {/* Settings Modal Dialog */}
      {settingsTool && (
        <IntegrationSettingsModal
          isOpen={!!settingsTool}
          onClose={() => setSettingsTool(null)}
          toolName={settingsTool.name}
        />
      )}
    </div>
  )
}
