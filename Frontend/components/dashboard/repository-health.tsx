'use client'

import React, { useEffect, useState } from 'react'
import { Activity, GitBranch, FolderGit2, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface RepositoryHealthProps {
  refreshKey?: number
  activeRepo?: string
  onOpenRepos?: () => void
  onNavigateIntegrations?: () => void
}

export function RepositoryHealth({
  refreshKey = 0,
  activeRepo: externalActiveRepo,
  onOpenRepos,
  onNavigateIntegrations,
}: RepositoryHealthProps) {
  const [repoName, setRepoName] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [githubUser, setGithubUser] = useState<string | null>(null)
  const [branchesCount, setBranchesCount] = useState<number | null>(null)
  const [defaultBranch, setDefaultBranch] = useState<string>('main')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkHealth = async () => {
      try {
        const status = await apiClient.getGitHubStatus()
        if (!isMounted) return

        const connected = Boolean(status.connected)
        setIsConnected(connected)
        setGithubUser(status.username || null)

        const active =
          externalActiveRepo ||
          status.selected_repo ||
          (typeof window !== 'undefined' ? localStorage.getItem('copilot_active_repo') || null : null)
        setRepoName(active)

        if (active && connected) {
          try {
            const b = await apiClient.fetchGitHubBranchesDetails(active)
            if (isMounted) {
              setBranchesCount(b.total_branches || (b.branches ? b.branches.length : null))
              setDefaultBranch(b.default_branch || 'main')
            }
          } catch {
            if (isMounted) {
              setBranchesCount(null)
            }
          }
        } else {
          setBranchesCount(null)
        }
      } catch {
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkHealth()

    return () => {
      isMounted = false
    }
  }, [refreshKey, externalActiveRepo])

  const telemetryRows = [
    {
      label: 'GitHub Integration',
      status: isConnected ? `Authorized (@${githubUser || 'user'})` : 'Disconnected',
      isOk: isConnected,
      action: !isConnected && onNavigateIntegrations ? { label: 'Connect', onClick: onNavigateIntegrations } : undefined,
    },
    {
      label: 'Repository Scope',
      status: repoName ? `Target: ${repoName}` : 'Unselected',
      isOk: Boolean(repoName),
      action: onOpenRepos ? { label: repoName ? 'Switch' : 'Select', onClick: onOpenRepos } : undefined,
    },
    {
      label: 'Remote Branches',
      status: branchesCount !== null ? `${branchesCount} active branch(es)` : (repoName ? 'Querying branches...' : 'No repo selected'),
      isOk: Boolean(branchesCount && branchesCount > 0),
    },
    {
      label: 'Default Branch',
      status: repoName ? defaultBranch : '—',
      isOk: Boolean(repoName),
    },
  ]

  return (
    <div className="p-4 rounded-2xl bg-card border border-border space-y-4 select-none shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Activity className="size-3.5" />
          </div>
          <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
            Repository Telemetry
          </h2>
        </div>

        <div className={`flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
          repoName && isConnected
            ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
            : 'text-muted-foreground bg-secondary border-border'
        }`}>
          {repoName && isConnected ? 'CONNECTED' : repoName ? 'OFFLINE' : 'STANDBY'}
        </div>
      </div>

      {/* Visual Health / Active Target Summary */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FolderGit2 className="size-4" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {repoName || 'No Repository Selected'}
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">
              {repoName
                ? `Active target context for code analysis & copilot grounded queries.`
                : 'Select an active repository to inspect branches and ground AI queries.'}
            </p>
          </div>
        </div>

        {onOpenRepos && (
          <button
            onClick={onOpenRepos}
            className="text-[11px] font-medium text-primary hover:underline shrink-0 cursor-pointer flex items-center gap-0.5"
          >
            {repoName ? 'Switch' : 'Select'} <ArrowUpRight className="size-3" />
          </button>
        )}
      </div>

      {/* Verified Telemetry Rows */}
      <div className="space-y-1.5 text-xs">
        {telemetryRows.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-2 rounded-lg bg-secondary/40 border border-border"
          >
            <span className="text-muted-foreground text-[11px]">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-medium">
                <span
                  className={`size-1.5 rounded-full ${
                    item.isOk ? 'bg-emerald-500' : 'bg-muted-foreground'
                  }`}
                />
                <span className={item.isOk ? 'text-foreground' : 'text-muted-foreground'}>
                  {item.status}
                </span>
              </div>
              {item.action && (
                <button
                  onClick={item.action.onClick}
                  className="text-[10px] text-primary hover:underline font-sans cursor-pointer"
                >
                  {item.action.label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
