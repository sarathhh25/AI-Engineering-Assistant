'use client'

import React from 'react'
import { GitCommit, GitBranch, ExternalLink, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { GitHubCommitDetail } from '@/lib/api-client'

interface GitChangesProps {
  repo?: string
  branch?: string
  commits?: GitHubCommitDetail[]
  selectedCommitSha?: string | null
  onSelectCommit?: (commit: GitHubCommitDetail) => void
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function GitChanges({
  repo,
  branch,
  commits = [],
  selectedCommitSha,
  onSelectCommit,
  isLoading = false,
  error = null,
  onRetry,
}: GitChangesProps) {
  return (
    <div className="space-y-3 select-none text-xs font-mono">
      {/* Header telemetry */}
      <div className="flex items-center justify-between text-muted-foreground font-semibold uppercase tracking-wider text-[10px] pb-1 border-b border-border">
        <span className="flex items-center gap-1.5 text-foreground">
          <GitBranch className="size-3.5 text-emerald-500" />
          <span>Branch Commits</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono text-[9px]">
          {branch ? `@${branch}` : 'Remote'}
        </span>
      </div>

      {/* Remote vs Local Status Indicator */}
      <div className="p-2.5 rounded-xl bg-secondary/50 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
        <span className="leading-tight">
          Browsing verified GitHub remote history. No uncommitted local workspace diffs.
        </span>
      </div>

      {isLoading && (
        <div className="p-6 text-center space-y-2 text-muted-foreground text-xs font-mono">
          <Loader2 className="size-4 animate-spin mx-auto text-primary" />
          <span>Fetching commit history...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/20 hover:bg-destructive/30 font-medium transition-colors cursor-pointer text-[10px]"
            >
              <RefreshCw className="size-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && commits.length === 0 && (
        <div className="p-6 text-center text-muted-foreground text-xs font-mono">
          No commits recorded for this branch.
        </div>
      )}

      {!isLoading && !error && commits.length > 0 && (
        <div className="space-y-1.5">
          {commits.map((c) => {
            const isSelected = selectedCommitSha === c.sha

            return (
              <div
                key={c.sha}
                onClick={() => onSelectCommit && onSelectCommit(c)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer font-mono text-xs space-y-1.5 ${
                  isSelected
                    ? 'bg-primary/15 border-primary/40 text-primary shadow-xs'
                    : 'bg-card border-border text-foreground hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] shrink-0 border border-primary/20">
                      {c.short_sha}
                    </span>
                    <span className="font-medium text-[11px] text-foreground truncate" title={c.message}>
                      {c.message}
                    </span>
                  </div>

                  {c.html_url && (
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
                      title="View commit on GitHub"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate max-w-[120px]">{c.author}</span>
                  {c.date && (
                    <span className="truncate">
                      {new Date(c.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
