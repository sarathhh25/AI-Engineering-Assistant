'use client'

import React, { useState } from 'react'
import {
  MessageSquare,
  HelpCircle,
  Bot,
  Zap,
  Code,
  ShieldCheck,
  ChevronDown,
  Check
} from 'lucide-react'

export interface AgentMode {
  id: string
  name: string
  icon: React.ElementType
  description: string
}

export const AGENT_MODES: AgentMode[] = [
  { id: 'chat', name: 'Chat', icon: MessageSquare, description: 'Simple conversational assistant' },
  { id: 'ask', name: 'Ask', icon: HelpCircle, description: 'Read-only Q&A and code explanation' },
  { id: 'agent', name: 'Agent', icon: Bot, description: 'Interactive code generation & file editing' },
  { id: 'autonomous', name: 'Autonomous Agent', icon: Zap, description: 'Plan, execute, test, and iterate automatically.' },
  { id: 'code-agent', name: 'Code Agent', icon: Code, description: 'Specialized in syntax, refactoring & type fixes' },
  { id: 'review-agent', name: 'Review Agent', icon: ShieldCheck, description: 'Pull request code review & vulnerability audit' },
]

interface AgentModeSelectorProps {
  activeModeId: string
  onSelectMode: (id: string) => void
}

export function AgentModeSelector({ activeModeId, onSelectMode }: AgentModeSelectorProps) {
  const [open, setOpen] = useState(false)
  const currentMode = AGENT_MODES.find((m) => m.id === activeModeId) || AGENT_MODES[3]
  const ModeIcon = currentMode.icon

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 text-zinc-200 transition-all text-xs shadow-sm"
      >
        <ModeIcon className="size-3.5 text-emerald-400 shrink-0" />
        <span className="font-medium text-[11px]">{currentMode.name}</span>
        <ChevronDown className="size-3 text-zinc-400 ml-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none">
          <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Agent Mode
          </div>

          <div className="space-y-1">
            {AGENT_MODES.map((mode) => {
              const isSelected = mode.id === currentMode.id
              const Icon = mode.icon

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    onSelectMode(mode.id)
                    setOpen(false)
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'hover:bg-white/[0.05] text-zinc-300'
                  }`}
                >
                  <Icon className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-medium text-xs text-zinc-100">
                      <span>{mode.name}</span>
                      {isSelected && <Check className="size-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">{mode.description}</p>
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
