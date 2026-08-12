'use client'

import React from 'react'
import { AlertTriangle, GitPullRequest, UserX } from 'lucide-react'

const SUGGESTIONS = [
  { label: 'Which feature is risky?', icon: AlertTriangle },
  { label: 'Which PR will probably fail?', icon: GitPullRequest },
  { label: 'Which engineer is blocked?', icon: UserX },
]

interface SuggestionPillsProps {
  onSelect: (value: string) => void
}

export function SuggestionPills({ onSelect }: SuggestionPillsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 select-none">
      {SUGGESTIONS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/50 dark:bg-zinc-900/80 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-zinc-800 hover:border-primary/40 transition-all shadow-sm active:scale-95 group"
        >
          <Icon className="size-3 text-primary/80 group-hover:text-primary group-hover:scale-110 transition-transform" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

