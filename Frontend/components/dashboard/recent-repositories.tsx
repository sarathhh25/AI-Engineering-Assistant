'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { RepositoryRow, RepoRowData } from './repository-row'

const REPOS: RepoRowData[] = [
  { id: 'r1', name: 'ai-engineering-assistant', owner: 'Sarath', language: 'TypeScript', branch: 'main', updated: '2m ago', status: 'Active' },
  { id: 'r2', name: 'Google_maps', owner: 'Sarath', language: 'Python', branch: 'main', updated: '1h ago', status: 'Active' },
  { id: 'r3', name: 'CuriousBees', owner: 'Sarath', language: 'Python', branch: 'main', updated: '3h ago', status: 'Active' },
  { id: 'r4', name: 'Financial-Tracker', owner: 'Sarath', language: 'Python', branch: 'main', updated: '1d ago', status: 'Active' },
]

interface RecentRepositoriesProps {
  onSelectRepo?: (repo: RepoRowData) => void
  onViewAll?: () => void
}

export function RecentRepositories({ onSelectRepo, onViewAll }: RecentRepositoriesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Recent Repositories
        </h2>
        <button
          onClick={() => {
            if (onViewAll) onViewAll()
            else alert('View all repositories triggered')
          }}
          className="text-primary hover:underline transition-colors text-[11px] font-medium flex items-center gap-1 cursor-pointer"
        >
          View all repositories <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto select-none shadow-xs">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-muted/80 text-[10px] text-muted-foreground uppercase border-b border-border">
            <tr>
              <th className="py-2.5 px-3.5 font-semibold">Repository</th>
              <th className="py-2.5 px-3 font-semibold">Owner</th>
              <th className="py-2.5 px-3 font-semibold">Language</th>
              <th className="py-2.5 px-3 font-semibold">Branch</th>
              <th className="py-2.5 px-3 font-semibold">Updated</th>
              <th className="py-2.5 px-3.5 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-foreground">
            {REPOS.map((repo) => (
              <RepositoryRow key={repo.id} repo={repo} onSelect={onSelectRepo} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
