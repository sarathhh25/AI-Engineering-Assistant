'use client'

import React from 'react'
import { Sparkles, Bug, GitPullRequest, FlaskConical, Layers, ShieldAlert } from 'lucide-react'

const SUGGESTIONS = [
  { text: 'Explain this repository', icon: Sparkles },
  { text: 'Find potential bugs', icon: Bug },
  { text: 'Show risky pull requests', icon: GitPullRequest },
  { text: 'Generate tests', icon: FlaskConical },
  { text: 'Explain the architecture', icon: Layers },
  { text: 'Find security issues', icon: ShieldAlert },
]

interface SuggestionPromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export function SuggestionPrompts({ onSelectPrompt }: SuggestionPromptsProps) {
  return (
    <div className="px-4 py-2 border-b border-white/[0.04] bg-[#0c0c0e]/50 select-none">
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">
        <Sparkles className="size-3 text-blue-400" /> Suggestion Prompts
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.text}
              onClick={() => onSelectPrompt(item.text)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white text-xs transition-all flex items-center gap-1.5 group"
            >
              <Icon className="size-3 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>{item.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
