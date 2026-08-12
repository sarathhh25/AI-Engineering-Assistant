'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  GitBranch,
  FolderGit2,
  ChevronDown,
  Settings,
  MoreVertical,
  Cpu,
  Check
} from 'lucide-react'

const CHAT_MODELS = [
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic' },
  { id: 'gpt-4-1', name: 'GPT-4.1', provider: 'OpenAI' },
  { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
]

interface ChatHeaderProps {
  selectedModel?: string
  onSelectModel?: (model: string) => void
  onOpenSettings?: () => void
}

export function ChatHeader({
  selectedModel = 'claude-3-7-sonnet',
  onSelectModel,
  onOpenSettings,
}: ChatHeaderProps) {
  const [modelOpen, setModelOpen] = useState(false)
  const [currentModel, setCurrentModel] = useState(selectedModel)

  const activeModelObj = CHAT_MODELS.find((m) => m.id === currentModel) || CHAT_MODELS[0]

  return (
    <div className="h-12 w-full shrink-0 border-b border-white/[0.08] bg-[#0c0c0e]/95 px-3 sm:px-4 flex items-center justify-between text-xs select-none z-20">
      {/* Left Identity & Repo Connection */}
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
          <Sparkles className="size-3.5" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100 text-xs tracking-tight">
              AI Engineering Copilot
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-medium">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Repository connected</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1 text-zinc-300">
              <FolderGit2 className="size-2.5 text-blue-400" /> ai-engineering-assistant
            </span>
            <span>/</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <GitBranch className="size-2.5 text-zinc-500" /> main
            </span>
          </div>
        </div>
      </div>

      {/* Right Model Selector & Actions */}
      <div className="flex items-center gap-2">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.08] hover:border-white/20 text-zinc-200 transition-all text-xs"
          >
            <Cpu className="size-3.5 text-blue-400 shrink-0" />
            <span className="font-medium text-[11px]">{activeModelObj.name}</span>
            <ChevronDown className="size-3 text-zinc-400 ml-0.5" />
          </button>

          {modelOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1 z-50 animate-in fade-in duration-100 text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Chat Model
              </div>
              {CHAT_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setCurrentModel(m.id)
                    if (onSelectModel) onSelectModel(m.id)
                    setModelOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    currentModel === m.id
                      ? 'bg-blue-500/15 text-blue-300 font-medium'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium">{m.name}</div>
                    <div className="text-[9px] text-zinc-500">{m.provider}</div>
                  </div>
                  {currentModel === m.id && <Check className="size-3 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings Icon Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="Chat Settings"
        >
          <Settings className="size-4" />
        </button>

        {/* More Options Button */}
        <button
          onClick={() => alert('Options menu clicked')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="More Options"
        >
          <MoreVertical className="size-4" />
        </button>
      </div>
    </div>
  )
}
