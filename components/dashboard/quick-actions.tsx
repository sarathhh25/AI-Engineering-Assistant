'use client'

import React, { useState } from 'react'
import {
  GitPullRequest,
  Code2,
  FlaskConical,
  Sparkles,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react'
import { QuickActionCard } from './quick-action-card'

const ACTIONS = [
  {
    id: 'pr-review',
    title: 'Analyze Repository',
    description: 'Run automated static analysis and security checks across active repository files.',
    icon: GitPullRequest,
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    border: 'hover:border-blue-500/40',
    resultSnippet: '✓ Scanned 142 files across ai-engineering-assistant.\n- Security: 0 Vulnerabilities\n- Performance: 2 API route caching opportunities.\n- Test Coverage: 88.4%',
  },
  {
    id: 'explain-code',
    title: 'Explain Code',
    description: 'Understand architecture, complex algorithms, and logic flow instantly.',
    icon: Code2,
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    border: 'hover:border-purple-500/40',
    resultSnippet: 'Explanation:\n- Main entrypoint initializes Next.js App Shell with 3-column layout.\n- Global keyboard listeners (⌘B, ⌘I, ⌘J, ⌘K) manage workspace sidebars.',
  },
  {
    id: 'gen-tests',
    title: 'Generate Tests',
    description: 'Synthesize unit, integration, and end-to-end mock test suites.',
    icon: FlaskConical,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    border: 'hover:border-emerald-500/40',
    resultSnippet: '```typescript\ndescribe("AppShell", () => {\n  it("toggles left sidebar on Cmd+B", () => {\n    // Automated test suite created\n  })\n})\n```',
  },
  {
    id: 'ask-copilot',
    title: 'Ask Copilot',
    description: 'Ask any engineering or design question across your entire codebase.',
    icon: Sparkles,
    color: 'from-blue-600/20 to-indigo-600/20 text-blue-400',
    border: 'hover:border-blue-500/50',
    resultSnippet: 'Copilot Response:\n"Your workspace contains 4 active projects and 6 repositories. All systems operational."',
  },
]

interface QuickActionsProps {
  onActionClick?: (actionId: string) => void
  deductCredits?: (amount?: number) => void
}

export function QuickActions({ onActionClick, deductCredits }: QuickActionsProps) {
  const [activeRunningAction, setActiveRunningAction] = useState<typeof ACTIONS[0] | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [resultText, setResultText] = useState<string | null>(null)

  const handleCardClick = (id: string) => {
    const act = ACTIONS.find((a) => a.id === id)
    if (act) {
      setActiveRunningAction(act)
      setIsRunning(true)
      setResultText(null)

      if (deductCredits) deductCredits(50)

      setTimeout(() => {
        setIsRunning(false)
        setResultText(act.resultSnippet)
      }, 1000)
    }

    if (onActionClick) onActionClick(id)
  }

  return (
    <div className="space-y-3 relative select-none">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
          Quick Actions
        </h2>
        <span className="text-[10px] text-zinc-500 font-mono">2x2 Workspace Grid</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((act) => (
          <QuickActionCard key={act.id} {...act} onClick={handleCardClick} />
        ))}
      </div>

      {/* Execution Runner Result Modal */}
      {activeRunningAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 text-xs select-none">
          <div className="w-full max-w-lg bg-[#121215] border border-white/15 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="size-3.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 text-sm">{activeRunningAction.title}</h3>
                  <p className="text-[10px] text-zinc-400">Executing Agent Task (-50 AI Credits)</p>
                </div>
              </div>

              <button
                onClick={() => setActiveRunningAction(null)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {isRunning ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="size-7 text-blue-400 animate-spin" />
                <span className="text-zinc-300 font-mono text-xs">
                  Running static analysis & indexing embeddings...
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-xs">
                  <CheckCircle2 className="size-4" />
                  <span>Execution Complete</span>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-white/10 font-mono text-[11px] text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {resultText}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveRunningAction(null)}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
