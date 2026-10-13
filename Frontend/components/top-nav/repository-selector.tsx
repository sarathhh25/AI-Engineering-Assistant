'use client'

import React, { useState, useEffect } from 'react'
import {
  GitBranch,
  FolderGit2,
  ChevronDown,
  Search,
  Check,
  Clock,
  Lock,
  Globe,
  Loader2,
} from 'lucide-react'
import { apiClient, GitHubRepositoryItem } from '@/lib/api-client'

export interface RepositorySelectorProps {
  currentRepo: string
  onSelectRepo: (repo: string) => void
  currentBranch: string
  onSelectBranch: (branch: string) => void
}

const DEFAULT_REPOSITORIES = [
  { id: 'ai-engineering-assistant', name: 'ai-engineering-assistant', isRecent: true, updated: 'Active' },
]

const DEFAULT_BRANCHES = ['main', 'develop', 'feature/app-shell']

export function RepositorySelector({
  currentRepo,
  onSelectRepo,
  currentBranch,
  onSelectBranch,
}: RepositorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'repos' | 'branches'>('repos')
  const [githubRepos, setGithubRepos] = useState<GitHubRepositoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Attempt to load real repositories from backend
    setLoading(true)
    apiClient
      .getGitHubRepositories(1, 50)
      .then((res) => {
        if (res.repositories && res.repositories.length > 0) {
          setGithubRepos(res.repositories)
        }
      })
      .catch(() => {
        // Disconnected or offline -> keep default list
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Combine local default repos with real remote repositories
  const combinedRepoList = [
    ...DEFAULT_REPOSITORIES.map((r) => ({
      id: r.id,
      name: r.name,
      isPrivate: false,
      language: 'TypeScript / Python',
    })),
    ...githubRepos
      .filter((r) => r.name !== 'ai-engineering-assistant' && r.full_name !== 'ai-engineering-assistant')
      .map((r) => ({
        id: String(r.id),
        name: r.full_name || r.name,
        isPrivate: r.private,
        language: r.language || 'Code',
      })),
  ]

  const filteredRepos = combinedRepoList.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectRepository = (name: string) => {
    onSelectRepo(name)
    apiClient.selectGitHubRepository(name).catch(() => {})
    if (typeof window !== 'undefined') {
      localStorage.setItem('copilot_active_repo', name)
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/[0.08] hover:border-white/20 text-xs text-zinc-200 transition-all shadow-sm group cursor-pointer"
      >
        <FolderGit2 className="size-3.5 text-blue-400 shrink-0" />
        <span className="font-mono text-[11px] font-semibold text-zinc-200 truncate max-w-[130px]">
          {currentRepo}
        </span>
        <div className="flex items-center gap-1 text-zinc-400">
          <GitBranch className="size-3 text-zinc-500" />
          <span className="text-[10px] font-mono text-zinc-400">{currentBranch}</span>
        </div>
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Repo Connected" />
        <ChevronDown className="size-3 text-zinc-400 group-hover:text-zinc-200 transition-colors ml-0.5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 select-none text-xs">
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-500" />
            <input
              autoFocus
              type="text"
              placeholder={tab === 'repos' ? 'Search repositories...' : 'Search branches...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Segmented Tab Bar */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-900 rounded-lg border border-white/5 mb-2">
            <button
              onClick={() => setTab('repos')}
              className={`py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                tab === 'repos' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Repositories ({combinedRepoList.length})
            </button>
            <button
              onClick={() => setTab('branches')}
              className={`py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                tab === 'branches' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Branches ({DEFAULT_BRANCHES.length})
            </button>
          </div>

          {/* Content View */}
          {tab === 'repos' ? (
            <div className="max-h-56 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Active & Remote Repos</span>
                {loading ? <Loader2 className="size-2.5 animate-spin" /> : <Clock className="size-2.5" />}
              </div>

              {filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => handleSelectRepository(repo.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    currentRepo === repo.name
                      ? 'bg-blue-500/15 text-blue-300 font-medium border border-blue-500/20'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {repo.isPrivate ? (
                      <Lock className="size-3 text-amber-400 shrink-0" />
                    ) : (
                      <FolderGit2 className="size-3.5 text-blue-400 shrink-0" />
                    )}
                    <span className="font-mono text-[11px] truncate">{repo.name}</span>
                  </div>
                  {currentRepo === repo.name && <Check className="size-3.5 text-blue-400" />}
                </button>
              ))}

              {filteredRepos.length === 0 && (
                <p className="text-center text-zinc-500 py-3 text-[11px]">
                  No repositories found
                </p>
              )}
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                Select Active Branch
              </div>
              {DEFAULT_BRANCHES.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    onSelectBranch(b)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-mono text-[11px] transition-colors cursor-pointer ${
                    currentBranch === b
                      ? 'bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/20'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="size-3.5 text-emerald-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                  {currentBranch === b && <Check className="size-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
