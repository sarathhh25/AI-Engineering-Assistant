'use client'

import React from 'react'
import { FolderGit2, GitBranch } from 'lucide-react'

export interface RepoRowData {
  id: string
  name: string
  fullName: string
  owner: string
  language: string
  branch: string
  updated: string
  status: string
  isActive?: boolean
}

interface RepositoryRowProps {
  repo: RepoRowData
  onSelect?: (repo: RepoRowData) => void
}

export function RepositoryRow({ repo, onSelect }: RepositoryRowProps) {
  return (
    <tr
      onClick={() => onSelect && onSelect(repo)}
      className={`hover:bg-muted/50 cursor-pointer transition-colors select-none ${
        repo.isActive ? 'bg-primary/5' : ''
      }`}
    >
      <td className="py-2.5 px-3.5 font-semibold text-foreground flex items-center gap-2">
        <FolderGit2 className={`size-3.5 shrink-0 ${repo.isActive ? 'text-emerald-500' : 'text-primary'}`} />
        <span className="truncate">{repo.name}</span>
        {repo.isActive && (
          <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
            ACTIVE
          </span>
        )}
      </td>
      <td className="py-2.5 px-3 text-muted-foreground">{repo.owner}</td>
      <td className="py-2.5 px-3 text-foreground">{repo.language}</td>
      <td className="py-2.5 px-3 text-muted-foreground flex items-center gap-1 font-mono">
        <GitBranch className="size-3 text-muted-foreground" /> {repo.branch}
      </td>
      <td className="py-2.5 px-3 text-muted-foreground text-[10px] font-mono">{repo.updated}</td>
      <td className="py-2.5 px-3.5 text-right font-mono">
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
          repo.status === 'Private'
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        }`}>
          <span className={`size-1.5 rounded-full ${repo.status === 'Private' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {repo.status}
        </span>
      </td>
    </tr>
  )
}
