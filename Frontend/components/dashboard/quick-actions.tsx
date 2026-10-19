'use client'

import React from 'react'
import {
  GitPullRequest,
  Code2,
  FlaskConical,
  Sparkles,
} from 'lucide-react'
import { QuickActionCard } from './quick-action-card'

interface QuickActionsProps {
  activeRepo?: string
  onActionClick?: (actionId: string) => void
  onOpenRepos?: () => void
}

export function QuickActions({ activeRepo, onActionClick, onOpenRepos }: QuickActionsProps) {
  const shortRepo = activeRepo ? (activeRepo.includes('/') ? activeRepo.split('/')[1] : activeRepo) : null

  const actions = [
    {
      id: 'analyze-repo',
      title: 'Analyze Repository',
      description: shortRepo
        ? `Launch automated code review and static analysis across ${shortRepo}.`
        : 'Select a repository and launch automated code review and static analysis.',
      icon: GitPullRequest,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-500',
      border: 'hover:border-blue-500/40',
    },
    {
      id: 'ask-copilot',
      title: 'Ask Copilot',
      description: shortRepo
        ? `Ask engineering and architecture questions grounded in ${shortRepo}.`
        : 'Open the Conversational Workspace to query codebases and debug.',
      icon: Sparkles,
      color: 'from-blue-600/20 to-indigo-600/20 text-primary',
      border: 'hover:border-primary/50',
    },
    {
      id: 'explain-code',
      title: 'Explain Code',
      description: 'Understand architecture, complex algorithms, and logic flow directly in Chat.',
      icon: Code2,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-500',
      border: 'hover:border-purple-500/40',
    },
    {
      id: 'gen-tests',
      title: 'Generate Tests',
      description: 'Synthesize unit, mock, and regression test suites using the Testing Agent.',
      icon: FlaskConical,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500',
      border: 'hover:border-emerald-500/40',
    },
  ]

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
        <span className="text-[10px] text-muted-foreground font-mono">
          {shortRepo ? `Target: ${shortRepo}` : 'Direct Shortcuts'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => (
          <QuickActionCard key={act.id} {...act} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  )
}
