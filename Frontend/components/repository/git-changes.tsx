'use client'

import React from 'react'
import { FileCode, Plus, Minus, Edit3, GitBranch } from 'lucide-react'

export interface GitChangeItem {
  id: string
  filename: string
  status: 'modified' | 'staged' | 'untracked'
  additions: number
  deletions: number
}

const DEMO_CHANGES: GitChangeItem[] = [
  { id: 'g1', filename: 'app/page.tsx', status: 'modified', additions: 12, deletions: 4 },
  { id: 'g2', filename: 'components/sidebar-left.tsx', status: 'staged', additions: 45, deletions: 8 },
  { id: 'g3', filename: 'components/top-nav.tsx', status: 'staged', additions: 88, deletions: 14 },
  { id: 'g4', filename: 'components/integrations/integrations-page.tsx', status: 'untracked', additions: 120, deletions: 0 },
]

interface GitChangesProps {
  selectedFile: string | null
  onSelectFile: (filename: string) => void
}

export function GitChanges({ selectedFile, onSelectFile }: GitChangesProps) {
  return (
    <div className="space-y-3 select-none text-xs">
      <div className="flex items-center justify-between text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
        <span className="flex items-center gap-1.5">
          <GitBranch className="size-3.5 text-emerald-500" /> Git Source Control
        </span>
        <span className="text-muted-foreground font-mono">4 changed files</span>
      </div>

      <div className="space-y-1">
        {DEMO_CHANGES.map((item) => {
          const isSelected = selectedFile === item.filename

          return (
            <div
              key={item.id}
              onClick={() => onSelectFile(item.filename)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-between font-mono text-[11px] ${
                isSelected
                  ? 'bg-primary/15 border-primary/30 text-primary font-medium shadow-xs'
                  : 'bg-card border-border text-foreground hover:bg-secondary/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{item.filename}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">+{item.additions}</span>
                <span className="text-amber-600 dark:text-amber-400 text-[10px]">-{item.deletions}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                    item.status === 'staged'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : item.status === 'modified'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-secondary text-muted-foreground border-border'
                  }`}
                >
                  {item.status === 'staged' ? 'S' : item.status === 'modified' ? 'M' : 'U'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
