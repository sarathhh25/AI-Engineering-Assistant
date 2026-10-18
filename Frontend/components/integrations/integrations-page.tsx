'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  GitPullRequest,
  Plug,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import { IntegrationSearch } from './integration-search'
import { IntegrationFilters, IntegrationFilterType } from './integration-filters'
import { IntegrationCard, IntegrationTool } from './integration-card'
import { IntegrationModal } from './integration-modal'
import { IntegrationSettingsModal } from './integration-settings-modal'
import { GitHubSetupModal } from './github-setup-modal'
import { ConnectionState } from './connection-status'
import { apiClient, GitHubIntegrationStatus } from '@/lib/api-client'
import { useUserProfile } from '@/lib/use-user-profile'

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
  const userProfile = useUserProfile()
  const githubAccessToken = (session as any)?.githubAccessToken
  const backendSessionToken = (session as any)?.backendToken

  const [tools, setTools] = useState<IntegrationTool[]>(INITIAL_TOOLS)
  const [githubStatus, setGithubStatus] = useState<GitHubIntegrationStatus | null>(null)
  const [githubErrorMessage, setGithubErrorMessage] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<IntegrationFilterType>('all')
  const [selectedModalTool, setSelectedModalTool] = useState<IntegrationTool | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const [settingsTool, setSettingsTool] = useState<IntegrationTool | null>(null)

  // Load GitHub integration status from backend and inspect OAuth callback params
  const refreshGitHubStatus = async () => {
    try {
      const status = await apiClient.getGitHubStatus()
      setGithubStatus(status)
      setTools((prev) =>
        prev.map((t) =>
          t.id === 'github'
            ? { ...t, status: status.connected ? 'Connected' : 'Disconnected' }
            : t
        )
      )
    } catch (err: any) {
      setGithubStatus({
        connected: false,
        status: 'Disconnected',
        message: err.message,
      })
    }
  }

  useEffect(() => {
    // 1. Check for URL redirect parameters from OAuth callback
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const ghStatus = params.get('github_status')
      const ghError = params.get('github_error')
      const ghUser = params.get('gh_user')

      if (ghStatus === 'connected') {
        setSuccessToast(`Successfully authorized and connected GitHub account ${ghUser ? `@${ghUser}` : ''}!`)
        setGithubErrorMessage(null)
        // Clean URL without refresh
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      } else if (ghError) {
        let msg = 'GitHub authorization failed.'
        const errDesc = params.get('err_desc')
        if (errDesc) msg = `GitHub error: ${decodeURIComponent(errDesc)}`
        else if (ghError === 'cancelled') msg = 'GitHub authorization was cancelled or denied.'
        else if (ghError === 'invalid_state') msg = 'Invalid OAuth security state or expired session.'
        else if (ghError === 'missing_credentials') msg = 'GitHub OAuth credentials (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET) are missing on the server.'
        setGithubErrorMessage(msg)
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      }
    }

    // Sync backend token from NextAuth session to apiClient and localStorage
    if (backendSessionToken) {
      apiClient.setToken(backendSessionToken)
    }

    // 2. Fetch real GitHub connection status from backend
    refreshGitHubStatus()

    // 3. Only sync GitHub token if NextAuth authenticated with GitHub and backend is not already connected
    if (githubAccessToken && typeof githubAccessToken === 'string' && githubAccessToken.trim().length > 0) {
      if (!githubStatus?.connected) {
        apiClient.syncGitHubToken(githubAccessToken).then(() => {
          refreshGitHubStatus()
        }).catch(() => {})
      }
    }
  }, [githubAccessToken, backendSessionToken, githubStatus?.connected])

  const handleConnectClick = async (tool: IntegrationTool) => {
    if (tool.id === 'github') {
      // Require authenticated application user
      if (!userProfile.isAuthenticated) {
        setGithubErrorMessage('Authentication required. Please log in before connecting your GitHub account.')
        return
      }

      // If server explicitly reports OAuth credentials not configured, open setup guidance modal
      if (githubStatus && githubStatus.configured === false) {
        setSetupModalOpen(true)
        return
      }

      setGithubErrorMessage(null)
      setTools((prev) =>
        prev.map((t) => (t.id === 'github' ? { ...t, status: 'Connecting' } : t))
      )

      try {
        const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard?tab=integrations` : undefined
        const res = await apiClient.startGitHubAuthorization(returnUrl)
        if (res.authorization_url) {
          window.location.href = res.authorization_url
          return
        }
      } catch (err: any) {
        setTools((prev) =>
          prev.map((t) => (t.id === 'github' ? { ...t, status: 'Error' } : t))
        )
        const errMsg = err.detail || err.message || 'Unable to start GitHub authorization.'
        setGithubErrorMessage(errMsg)
        if (errMsg.toLowerCase().includes('configured') || errMsg.toLowerCase().includes('client_id')) {
          setSetupModalOpen(true)
        }
      }
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
      setTools((prev) =>
        prev.map((t) =>
          t.id === toolId ? { ...t, status: 'Connected' as ConnectionState } : t
        )
      )
    }, 600)
  }

  const handleDisconnect = async (toolId: string) => {
    if (toolId === 'github') {
      try {
        await apiClient.disconnectGitHub()
        setGithubStatus({
          connected: false,
          status: 'Disconnected',
          username: null,
          avatar_url: null,
          selected_repo: null,
        })
        setTools((prev) =>
          prev.map((t) => (t.id === 'github' ? { ...t, status: 'Disconnected' } : t))
        )
        setSuccessToast('GitHub account disconnected successfully.')
      } catch (err: any) {
        setGithubErrorMessage(`Failed to disconnect GitHub: ${err.message}`)
      }
      return
    }

    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, status: 'Disconnected' } : t))
    )
  }

  const isGithubConnected = !!githubStatus?.connected

  const filteredTools = tools.map((tool) => {
    if (tool.id === 'github') {
      return {
        ...tool,
        status: isGithubConnected
          ? ('Connected' as ConnectionState)
          : githubErrorMessage
          ? ('Error' as ConnectionState)
          : tool.status,
      }
    }
    return tool
  }).filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    const isConnected = tool.status === 'Connected'
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

      {/* Notifications / Alerts */}
      {!userProfile.isAuthenticated && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>You are currently not signed in. Please log in before connecting your GitHub account.</span>
          </div>
          <a
            href="/login"
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-colors hover:bg-primary/90 shrink-0 text-center"
          >
            Log In Now →
          </a>
        </div>
      )}

      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {githubErrorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{githubErrorMessage}</span>
          </div>
          <button
            onClick={() => setGithubErrorMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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
            githubStatus={githubStatus}
            githubErrorMessage={githubErrorMessage}
            onConnectClick={handleConnectClick}
            onDisconnectClick={handleDisconnect}
            onOpenSettings={(t) => setSettingsTool(t)}
            onOpenSetupGuide={() => setSetupModalOpen(true)}
            onDismissError={() => setGithubErrorMessage(null)}
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

      {/* GitHub OAuth Setup Guide Modal */}
      <GitHubSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onCheckAgain={async () => {
          await refreshGitHubStatus()
          setSetupModalOpen(false)
        }}
      />

      {/* Settings Modal Dialog */}
      {settingsTool && (
        <IntegrationSettingsModal
          isOpen={!!settingsTool}
          onClose={() => {
            setSettingsTool(null)
            refreshGitHubStatus()
          }}
          toolName={settingsTool.name}
          githubStatus={githubStatus}
          onStatusChange={refreshGitHubStatus}
        />
      )}
    </div>
  )
}
