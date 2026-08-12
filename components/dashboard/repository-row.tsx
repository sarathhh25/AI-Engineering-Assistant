'use client'

import React from 'react'
import { FolderGit2, GitBranch } from 'lucide-react'

export interface RepoRowData {
  id: string
  name: string
  owner: string
  language: string
  branch: string
  updated: string
  status: string
}

interface RepositoryRowProps {
  repo: RepoRowData
  onSelect?: (repo: RepoRowData) => void
}

export function RepositoryRow({ repo, onSelect }: RepositoryRowProps) {
  return (
    <tr
      onClick={() => onSelect && onSelect(repo)}
      className="hover:bg-white/[0.04] cursor-pointer transition-colors select-none"
    >
      <td className="py-2.5 px-3 font-semibold text-zinc-100 flex items-center gap-2">
        <FolderGit2 className="size-3.5 text-blue-400 shrink-0" />
        <span>{repo.name}</span>
      </td>
      <td className="py-2.5 px-3 text-zinc-400">{repo.owner}</td>
      <td className="py-2.5 px-3 text-zinc-300">{repo.language}</td>
      <td className="py-2.5 px-3 text-zinc-400 flex items-center gap-1">
        <GitBranch className="size-3 text-zinc-500" /> {repo.branch}
      </td>
      <td className="py-2.5 px-3 text-zinc-500 text-[10px]">{repo.updated}</td>
      <td className="py-2.5 px-3 text-right">
        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-400" /> {repo.status}
        </span>
      </td>
    </tr>
  )
}
