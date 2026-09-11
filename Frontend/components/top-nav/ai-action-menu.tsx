'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  ChevronDown,
  HelpCircle,
  Code,
  Zap,
  FileText,
  ShieldCheck,
  Bug
} from 'lucide-react'

interface AIActionMenuProps {
  onSelectAction?: (action: string) => void
}

const AI_ACTIONS = [
  { id: 'explain', name: 'Explain Code', icon: HelpCircle, desc: 'Detailed line-by-line explanation' },
  { id: 'refactor', name: 'Refactor', icon: Code, desc: 'Optimize performance and readability' },
  { id: 'gen-tests', name: 'Generate Tests', icon: Zap, desc: 'Create Jest/PyTest test harness' },
  { id: 'gen-docs', name: 'Generate Documentation', icon: FileText, desc: 'Produce JSDoc/Docstring specs' },
  { id: 'review', name: 'Review Code', icon: ShieldCheck, desc: 'Check style and security flaws' },
  { id: 'fix-errors', name: 'Fix Errors', icon: Bug, desc: 'Auto-repair syntax & runtime bugs' },
]

export function AIActionMenu({ onSelectAction }: AIActionMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 transition-all text-xs font-medium shadow-sm group"
      >
        <Sparkles className="size-3.5 text-blue-400 shrink-0" />
        <span className="text-[11px]">AI Actions</span>
        <ChevronDown className="size-3 text-blue-400 group-hover:text-blue-200 transition-colors ml-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none">
          <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Quick AI Trigger
          </div>

          <div className="space-y-1">
            {AI_ACTIONS.map((action) => {
              const Icon = action.icon

              return (
                <button
                  key={action.id}
                  onClick={() => {
                    if (onSelectAction) onSelectAction(action.name)
                    setOpen(false)
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-500/15 hover:text-blue-300 text-zinc-300 transition-colors flex items-center gap-2 group"
                >
                  <Icon className="size-3.5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div>
                    <div className="text-xs font-medium">{action.name}</div>
                    <div className="text-[9px] text-zinc-500">{action.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
