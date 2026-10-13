'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Settings,
  RefreshCw,
  GitBranch,
  User,
  Search,
  Lock,
  Globe,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import {
  apiClient,
  GitHubIntegrationStatus,
  GitHubRepositoryItem,
} from '@/lib/api-client'

interface IntegrationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
  githubStatus?: GitHubIntegrationStatus | null
  onStatusChange?: () => void
}

export function IntegrationSettingsModal({
  isOpen,
  onClose,
  toolName,
  githubStatus = null,
  onStatusChange,
}: IntegrationSettingsModalProps) {
  const isGitHub = toolName.toLowerCase() === 'github'

  const [repos, setRepos] = useState<GitHubRepositoryItem[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [repoSearch, setRepoSearch] = useState('')
  const [selectedRepo, setSelectedRepo] = useState(
    githubStatus?.selected_repo || 'ai-engineering-assistant'
  )
  const [selectedBranch, setSelectedBranch] = useState('main')
  const [isSaving, setIsSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Fetch real repositories from backend GitHub API when opened
  useEffect(() => {
    if (!isOpen) return

    if (githubStatus?.selected_repo) {
      setSelectedRepo(githubStatus.selected_repo)
    } else {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('copilot_active_repo') : null
      if (saved) setSelectedRepo(saved)
    }

    if (isGitHub) {
      setLoadingRepos(true)
      setRepoError(null)

      apiClient
        .getGitHubRepositories(1, 100)
        .then((res) => {
          setRepos(res.repositories || [])
          if (res.selected_repo) {
            setSelectedRepo(res.selected_repo)
          }
        })
        .catch((err) => {
          setRepoError(err.message || 'Failed to fetch repositories from GitHub.')
        })
        .finally(() => {
          setLoadingRepos(false)
        })
    }
  }, [isOpen, isGitHub, githubStatus])

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isGitHub && selectedRepo) {
        await apiClient.selectGitHubRepository(selectedRepo)
        if (typeof window !== 'undefined') {
          localStorage.setItem('copilot_active_repo', selectedRepo)
        }
      }
      setToastMsg('Settings and target repository saved successfully.')
      if (onStatusChange) onStatusChange()
      setTimeout(() => {
        setToastMsg(null)
        onClose()
      }, 700)
    } catch (err: any) {
      setToastMsg(`Error: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangeAccount = async () => {
    try {
      const res = await apiClient.startGitHubAuthorization(window.location.origin + '/integrations')
      if (res.authorization_url) {
        window.location.href = res.authorization_url
      }
    } catch (err: any) {
      setToastMsg(`Authorization error: ${err.message}`)
    }
  }

  const filteredRepos = repos.filter((r) =>
    r.full_name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    r.name.toLowerCase().includes(repoSearch.toLowerCase())
  )

  const accountName = githubStatus?.username || 'Connected Developer'
  const accountAvatar = githubStatus?.avatar_url

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 text-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 font-mono max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Settings className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground font-sans">
                {toolName} Configuration
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Integration Settings & Account Preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {toastMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 shrink-0">
            <Check className="size-3.5" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {/* 1. Account Section: Verified GitHub Account */}
          <div className="space-y-1.5 p-3 rounded-xl bg-secondary/60 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <User className="size-3 text-primary" /> Active GitHub Account
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                {accountAvatar ? (
                  <img
                    src={accountAvatar}
                    alt={accountName}
                    className="size-8 rounded-full border border-border shrink-0"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {accountName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-foreground truncate font-sans">
                    @{accountName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {githubStatus?.scopes?.join(', ') || 'Repository access'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleChangeAccount}
                className="px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Reconnect / Switch</span>
              </button>
            </div>
          </div>

          {/* 2. Real Repository Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <GitBranch className="size-3 text-primary" /> Target Repository for AI Analysis
              </label>
              {repos.length > 0 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {repos.length} Repositories Available
                </span>
              )}
            </div>

            {/* Search filter for repositories */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your GitHub repositories..."
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
              />
            </div>

            {loadingRepos ? (
              <div className="p-4 rounded-xl bg-secondary/40 border border-border text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Retrieving repositories from GitHub API...</span>
              </div>
            ) : repoError ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{repoError}</span>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-border rounded-xl p-1.5 bg-secondary/30">
                {/* Local Workspace Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRepo('ai-engineering-assistant')}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                    selectedRepo === 'ai-engineering-assistant'
                      ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="size-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">ai-engineering-assistant (Local Workspace)</span>
                  </div>
                  {selectedRepo === 'ai-engineering-assistant' && (
                    <Check className="size-3.5 text-primary shrink-0" />
                  )}
                </button>

                {/* Real Remote GitHub Repositories */}
                {filteredRepos.map((r) => {
                  const isSelected = selectedRepo === r.name || selectedRepo === r.full_name
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRepo(r.full_name)}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                          : 'hover:bg-secondary text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {r.private ? (
                          <Lock className="size-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <Globe className="size-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">{r.full_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          • {r.language}
                        </span>
                      </div>
                      {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                    </button>
                  )
                })}

                {filteredRepos.length === 0 && repos.length > 0 && (
                  <p className="text-center text-muted-foreground text-xs p-3">
                    No repositories match &quot;{repoSearch}&quot;
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Branch Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Target Sync Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs text-foreground outline-none cursor-pointer"
            >
              <option value="main">main (Default)</option>
              <option value="master">master</option>
              <option value="develop">develop</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
