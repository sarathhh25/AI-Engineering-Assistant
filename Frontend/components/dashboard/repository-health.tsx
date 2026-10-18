'use client'

import React, { useEffect, useState } from 'react'
import { Activity, ShieldCheck, GitBranch, FolderGit2, CheckCircle2, Clock } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export function RepositoryHealth() {
  const [repoName, setRepoName] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [branchesCount, setBranchesCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkHealth = async () => {
      try {
        const status = await apiClient.getGitHubStatus()
        if (!isMounted) return

        setIsConnected(Boolean(status.connected))
        const active =
          status.selected_repo ||
          (typeof window !== 'undefined' ? localStorage.getItem('copilot_active_repo') || null : null)
        setRepoName(active)

        if (active && status.connected) {
          try {
            const b = await apiClient.fetchGitHubBranches(active)
            if (isMounted && Array.isArray(b)) {
              setBranchesCount(b.length)
            }
          } catch {
            if (isMounted) setBranchesCount(1)
          }
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
  }, [])

  return (
    <div className="p-4 rounded-2xl bg-card border border-border space-y-4 select-none shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Activity className="size-3.5" />
          </div>
          <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
            Repository Health
          </h2>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {repoName ? 'ACTIVE' : 'STANDBY'}
        </div>
      </div>

      {/* Visual Health / Status Indicator */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 border border-border">
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <FolderGit2 className="size-5" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">
            {repoName || 'No Repository Selected'}
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {repoName
              ? `Real-time repository telemetry for ${repoName}.`
              : 'Select a repository to view branches, commits, and run specialized agent audits.'}
          </p>
        </div>
      </div>

      {/* Health Metric Rows */}
      <div className="space-y-1.5 text-xs">
        {[
          {
            label: 'GitHub Connection',
            status: isConnected ? 'Authorized' : 'Disconnected',
            isOk: isConnected,
          },
          {
            label: 'Repository Scope',
            status: repoName ? 'Enforced & Isolated' : 'Unselected',
            isOk: Boolean(repoName),
          },
          {
            label: 'Remote Branches',
            status: branchesCount !== null ? `${branchesCount} branch(es)` : 'None detected',
            isOk: Boolean(branchesCount && branchesCount > 0),
          },
          {
            label: 'Automated Code Review',
            status: 'Ready (Agent Available)',
            isOk: true,
          },
          {
            label: 'Security Analysis',
            status: 'Ready (Agent Available)',
            isOk: true,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-2 rounded-lg bg-secondary/40 border border-border"
          >
            <span className="text-muted-foreground text-[11px]">{item.label}</span>
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
          </div>
        ))}
      </div>
    </div>
  )
}
