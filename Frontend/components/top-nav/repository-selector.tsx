'use client'

import React, { useState } from 'react'
import {
  GitBranch,
  FolderGit2,
  ChevronDown,
  Search,
  Plus,
  Check,
  Clock,
  Sparkles
} from 'lucide-react'

export interface RepositorySelectorProps {
  currentRepo: string
  onSelectRepo: (repo: string) => void
  currentBranch: string
  onSelectBranch: (branch: string) => void
}

const REPOSITORIES = [
  { id: 'ai-engineering-assistant', name: 'ai-engineering-assistant', isRecent: true, updated: '2m ago' },
  { id: 'Google_maps', name: 'Google_maps', isRecent: true, updated: '1d ago' },
  { id: 'CuriousBees', name: 'CuriousBees', isRecent: false, updated: '3d ago' },
  { id: 'Financial Tracker', name: 'Financial Tracker', isRecent: false, updated: '1w ago' },
]

const BRANCHES = ['main', 'develop', 'feature/ai-agent']

export function RepositorySelector({
  currentRepo,
  onSelectRepo,
  currentBranch,
  onSelectBranch,
}: RepositorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'repos' | 'branches'>('repos')

  const filteredRepos = REPOSITORIES.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/[0.08] hover:border-white/20 text-xs text-zinc-200 transition-all shadow-sm group"
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
              className={`py-1 rounded-md text-[11px] font-medium transition-all ${
                tab === 'repos' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Repositories ({REPOSITORIES.length})
            </button>
            <button
              onClick={() => setTab('branches')}
              className={`py-1 rounded-md text-[11px] font-medium transition-all ${
                tab === 'branches' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Branches ({BRANCHES.length})
            </button>
          </div>

          {/* Content View */}
          {tab === 'repos' ? (
            <div className="max-h-48 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Recent Repositories</span>
                <Clock className="size-2.5" />
              </div>
              {filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => {
                    onSelectRepo(repo.name)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    currentRepo === repo.name
                      ? 'bg-blue-500/15 text-blue-300 font-medium border border-blue-500/20'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderGit2 className="size-3.5 text-blue-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{repo.name}</span>
                  </div>
                  {currentRepo === repo.name && <Check className="size-3.5 text-blue-400" />}
                </button>
              ))}

              <button
                onClick={() => {
                  alert('Create / Import repository triggered')
                  setOpen(false)
                }}
                className="w-full mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-dashed border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
              >
                <Plus className="size-3.5 text-blue-400" />
                <span>Import or Create Repository</span>
              </button>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                Select Active Branch
              </div>
              {BRANCHES.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    onSelectBranch(b)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-mono text-[11px] transition-colors ${
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
