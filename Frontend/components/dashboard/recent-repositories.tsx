'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ArrowRight, Loader2, AlertCircle, RefreshCw, FolderGit2 } from 'lucide-react'
import { RepositoryRow, RepoRowData } from './repository-row'
import { apiClient } from '@/lib/api-client'

interface RecentRepositoriesProps {
  onSelectRepo?: (repo: RepoRowData) => void
  onViewAll?: () => void
}

export function RecentRepositories({ onSelectRepo, onViewAll }: RecentRepositoriesProps) {
  const [repos, setRepos] = useState<RepoRowData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRepositories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getGitHubRepositories(1, 10)
      if (res && res.repositories && res.repositories.length > 0) {
        const mapped: RepoRowData[] = res.repositories.map((r) => {
          const parts = (r.full_name || '').split('/')
          const owner = parts.length > 1 ? parts[0] : 'You'
          return {
            id: String(r.id),
            name: r.name,
            owner: owner,
            language: r.language || 'Code',
            branch: r.default_branch || 'main',
            updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : (r.private ? 'Private' : 'Public'),
            status: r.private ? 'Private' : 'Active',
          }
        })
        setRepos(mapped)
      } else {
        setRepos([])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve GitHub repositories.')
      setRepos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRepositories()
  }, [loadRepositories])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-2">
          <span>Connected GitHub Repositories</span>
          {!loading && repos.length > 0 && (
            <span className="font-mono text-[10px] text-muted-foreground">({repos.length})</span>
          )}
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-primary hover:underline transition-colors text-[11px] font-medium flex items-center gap-1 cursor-pointer"
          >
            View all repositories <ArrowRight className="size-3" />
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto select-none shadow-xs">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2 text-xs">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>Fetching real repositories from GitHub API...</span>
          </div>
        ) : error ? (
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <AlertCircle className="size-6 text-destructive" />
            <p className="text-xs text-destructive font-medium">{error}</p>
            <button
              onClick={loadRepositories}
              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className="size-3" /> Retry Retrieval
            </button>
          </div>
        ) : repos.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-2">
            <FolderGit2 className="size-8 text-muted-foreground/60 mx-auto" />
            <p className="text-xs text-muted-foreground">
              No repositories found. Connect your GitHub account in Integrations Hub to inspect repositories.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-muted/80 text-[10px] text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="py-2.5 px-3.5 font-semibold">Repository</th>
                <th className="py-2.5 px-3 font-semibold">Owner</th>
                <th className="py-2.5 px-3 font-semibold">Language</th>
                <th className="py-2.5 px-3 font-semibold">Branch</th>
                <th className="py-2.5 px-3 font-semibold">Updated</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground">
              {repos.map((repo) => (
                <RepositoryRow key={repo.id} repo={repo} onSelect={onSelectRepo} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
