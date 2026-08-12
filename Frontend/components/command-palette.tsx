'use client'

import React, { useEffect, useState } from 'react'
import {
  Search,
  Sparkles,
  FileCode,
  Terminal,
  Cpu,
  Zap,
  Sliders,
  ShieldCheck,
  Check,
  X
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectModel: (model: string) => void
  onSelectFile: (file: string) => void
}

const COMMAND_ITEMS = [
  { id: 'act-1', category: 'Agent Actions', title: 'Generate Architecture Diagram & Plan', icon: Sparkles, badge: 'Agent' },
  { id: 'act-2', category: 'Agent Actions', title: 'Run Code Security & Type Audit', icon: ShieldCheck, badge: 'Audit' },
  { id: 'act-3', category: 'Agent Actions', title: 'Re-index Entire Repository into Vector DB', icon: Zap, badge: 'RAG' },
  { id: 'mod-1', category: 'Switch Model', title: 'Switch to Claude 3.7 Sonnet', icon: Cpu, modelId: 'claude-3-7-sonnet' },
  { id: 'mod-2', category: 'Switch Model', title: 'Switch to GPT-4o', icon: Cpu, modelId: 'gpt-4o' },
  { id: 'mod-3', category: 'Switch Model', title: 'Switch to DeepSeek R1', icon: Cpu, modelId: 'deepseek-r1' },
  { id: 'file-1', category: 'Quick Open', title: 'app/globals.css', icon: FileCode, fileId: 'app/globals.css' },
  { id: 'file-2', category: 'Quick Open', title: 'Backend/main.py', icon: FileCode, fileId: 'Backend/main.py' },
  { id: 'file-3', category: 'Quick Open', title: 'components/app-shell.tsx', icon: FileCode, fileId: 'components/app-shell.tsx' },
]

export function CommandPalette({ isOpen, onClose, onSelectModel, onSelectFile }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
      }
      if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault()
        executeItem(filteredItems[selectedIndex])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, query, selectedIndex])

  if (!isOpen) return null

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const executeItem = (item: typeof COMMAND_ITEMS[0]) => {
    if (item.modelId) {
      onSelectModel(item.modelId)
    } else if (item.fileId) {
      onSelectFile(item.fileId)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#121215] border border-white/15 rounded-xl shadow-2xl overflow-hidden select-none">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
          <Search className="size-4 text-zinc-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, model name, or search files..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-800 border border-white/10 text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">No matching commands found.</div>
          ) : (
            filteredItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  selectedIndex === idx
                    ? 'bg-blue-600/20 text-white font-medium border border-blue-500/30'
                    : 'text-zinc-300 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`size-4 ${selectedIndex === idx ? 'text-blue-400' : 'text-zinc-400'}`} />
                  <span>{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono">{item.category}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 border border-white/10 text-zinc-400">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2 bg-zinc-950/80 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">↵</kbd> Select
            </span>
          </div>
          <span>Antigravity Palette</span>
        </div>
      </div>
    </div>
  )
}
