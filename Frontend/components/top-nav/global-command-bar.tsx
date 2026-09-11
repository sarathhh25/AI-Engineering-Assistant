'use client'

import React from 'react'
import { Search, Sparkles } from 'lucide-react'

interface GlobalCommandBarProps {
  onOpen: () => void
}

export function GlobalCommandBar({ onOpen }: GlobalCommandBarProps) {
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900/70 border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-zinc-200 transition-all shadow-inner group relative overflow-hidden"
    >
      <div className="flex items-center gap-2 truncate">
        <Search className="size-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors shrink-0" />
        <span className="text-[11px] font-normal truncate">
          Search files, run actions, or ask the AI...
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-zinc-800 border border-white/10 text-zinc-400">
          ⌘K
        </kbd>
      </div>
    </button>
  )
}
