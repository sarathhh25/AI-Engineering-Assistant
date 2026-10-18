'use client'

import React from 'react'
import {
  GitPullRequest,
  Code2,
  FlaskConical,
  Sparkles,
} from 'lucide-react'
import { QuickActionCard } from './quick-action-card'

const ACTIONS = [
  {
    id: 'pr-review',
    title: 'Analyze Repository',
    description: 'Run automated static analysis and security checks across active repository files.',
    icon: GitPullRequest,
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-500',
    border: 'hover:border-blue-500/40',
  },
  {
    id: 'explain-code',
    title: 'Explain Code',
    description: 'Understand architecture, complex algorithms, and logic flow directly with Copilot.',
    icon: Code2,
    color: 'from-purple-500/20 to-pink-500/20 text-purple-500',
    border: 'hover:border-purple-500/40',
  },
  {
    id: 'gen-tests',
    title: 'Generate Tests',
    description: 'Synthesize unit, integration, and regression test suites using the Test Agent.',
    icon: FlaskConical,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500',
    border: 'hover:border-emerald-500/40',
  },
  {
    id: 'ask-copilot',
    title: 'Ask Copilot',
    description: 'Ask any engineering or design question across your selected repository.',
    icon: Sparkles,
    color: 'from-blue-600/20 to-indigo-600/20 text-primary',
    border: 'hover:border-primary/50',
  },
]

interface QuickActionsProps {
  onActionClick?: (actionId: string) => void
  deductCredits?: (amount?: number) => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const handleCardClick = (id: string) => {
    if (onActionClick) {
      onActionClick(id)
    }
  }

  return (
    <div className="space-y-3 relative select-none">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
          Quick Actions
        </h2>
        <span className="text-[10px] text-muted-foreground font-mono">Workspace Shortcuts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((act) => (
          <QuickActionCard key={act.id} {...act} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  )
}
