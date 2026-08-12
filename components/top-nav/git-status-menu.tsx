'use client'

import React, { useState } from 'react'
import { GitBranch, GitCommit, Check, RefreshCw, FileCode } from 'lucide-react'

interface GitStatusMenuProps {
  currentBranch: string
  changedFilesCount?: number
}

export function GitStatusMenu({ currentBranch, changedFilesCount = 3 }: GitStatusMenuProps) {
  const [open, setOpen] = useState(false)
  const isClean = changedFilesCount === 0

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/[0.08] hover:border-white/20 text-xs transition-all text-zinc-300 shadow-sm"
      >
        <span className={`size-2 rounded-full ${isClean ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
        <span className="font-mono text-[11px] font-medium">{currentBranch}</span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {isClean ? 'Clean' : `${changedFilesCount} changes`}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none space-y-2">
          <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Git Working Tree</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
              <Check className="size-3" /> Synced
            </span>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <GitBranch className="size-3.5 text-emerald-400" /> {currentBranch}
              </span>
              <span className="text-[9px] text-zinc-500">origin/{currentBranch}</span>
            </div>
            <div className="text-[10px] text-zinc-400">Head: commit 7f8b9a2 (Latest agent shell)</div>
          </div>

          {!isClean && (
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Uncommitted Changes ({changedFilesCount})
              </div>
              <div className="space-y-1">
                {['app/page.tsx', 'components/sidebar-left.tsx', 'components/top-nav.tsx'].map((file) => (
                  <div
                    key={file}
                    className="flex items-center justify-between p-1.5 rounded bg-zinc-900/40 border border-white/[0.04] text-[11px] font-mono text-zinc-300"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <FileCode className="size-3 text-amber-400" /> {file}
                    </span>
                    <span className="text-[9px] text-amber-400 font-semibold uppercase">M</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              alert('Triggered git fetch / sync')
              setOpen(false)
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs transition-colors"
          >
            <RefreshCw className="size-3 text-blue-400" /> Fetch & Sync Branch
          </button>
        </div>
      )}
    </div>
  )
}
