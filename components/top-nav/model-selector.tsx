'use client'

import React, { useState } from 'react'
import { Cpu, ChevronDown, Check, Zap, Gauge } from 'lucide-react'

export interface AIModel {
  id: string
  name: string
  provider: string
  reasoning: string
  speed: string
  description: string
  tags: string[]
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    reasoning: 'High reasoning',
    speed: 'Fast',
    description: 'Premier model for complex code architecture & deep analysis.',
    tags: ['Coding', 'Analysis', 'Planning'],
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    reasoning: 'Standard reasoning',
    speed: 'Ultra Fast',
    description: 'Optimized for high-speed refactoring & clean code generation.',
    tags: ['Coding', 'Refactoring'],
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    reasoning: 'Frontier reasoning',
    speed: 'Balanced',
    description: 'Next-gen reasoning engine for end-to-end autonomous agents.',
    tags: ['Deep Reasoning', 'Math', 'Code'],
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 mini',
    provider: 'OpenAI',
    reasoning: 'Lightweight',
    speed: 'Lightning',
    description: 'Ultra lightweight model for quick syntax checks and small edits.',
    tags: ['Fast Edits', 'Syntax'],
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    reasoning: '2M Context',
    speed: 'Fast',
    description: 'Massive 2 Million token context for whole-repo analysis.',
    tags: ['Huge Context', 'Multi-file'],
  },
  {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    reasoning: 'Ultra Fast',
    speed: 'Instant',
    description: 'Instant response model for chat and rapid code auto-complete.',
    tags: ['Chat', 'Quick Fixes'],
  },
]

interface ModelSelectorProps {
  activeModelId: string
  onSelectModel: (id: string) => void
}

export function ModelSelector({ activeModelId, onSelectModel }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const currentModel = AI_MODELS.find((m) => m.id === activeModelId) || AI_MODELS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 text-zinc-200 transition-all text-xs shadow-sm"
      >
        <Cpu className="size-3.5 text-blue-400 shrink-0" />
        <span className="font-medium text-[11px]">{currentModel.name}</span>
        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">
          {currentModel.reasoning}
        </span>
        <ChevronDown className="size-3 text-zinc-400 ml-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none">
          <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Select AI Model
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1">
            {AI_MODELS.map((m) => {
              const isSelected = m.id === currentModel.id

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id)
                    setOpen(false)
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-blue-500/15 border border-blue-500/30 text-white'
                      : 'hover:bg-white/[0.05] text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-100">
                      <span>{m.name}</span>
                      <span className="text-[9px] text-zinc-500 font-normal">({m.provider})</span>
                    </div>
                    {isSelected && <Check className="size-3.5 text-blue-400 shrink-0" />}
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-tight">{m.description}</p>

                  <div className="flex items-center justify-between pt-1 text-[9px] font-mono">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Gauge className="size-3 text-amber-400" />
                      <span>{m.speed}</span>
                    </div>
                    <div className="flex gap-1 text-blue-400">
                      {m.tags.map((tag) => (
                        <span key={tag} className="px-1 py-0.2 rounded bg-zinc-800 border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
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
