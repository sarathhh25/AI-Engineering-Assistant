'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  GitBranch,
  Settings,
  Sparkles,
  ShieldCheck,
  Zap,
  Bug,
  FileText,
  Code,
  FileCode,
  GitCommit,
  Terminal,
  Play
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectAction?: (action: string) => void
}

interface CommandItem {
  id: string
  category: 'Navigation' | 'AI Actions' | 'Developer Actions'
  title: string
  icon: React.ElementType
  shortcut?: string
}

const COMMANDS: CommandItem[] = [
  // Navigation
  { id: 'nav-dashboard', category: 'Navigation', title: 'Go to Dashboard', icon: LayoutDashboard, shortcut: 'G D' },
  { id: 'nav-new-chat', category: 'Navigation', title: 'New Chat', icon: MessageSquare, shortcut: '⌘N' },
  { id: 'nav-recent', category: 'Navigation', title: 'Recent Chats', icon: MessageSquare, shortcut: 'G R' },
  { id: 'nav-projects', category: 'Navigation', title: 'Projects', icon: FolderKanban },
  { id: 'nav-repos', category: 'Navigation', title: 'Repositories', icon: GitBranch },
  { id: 'nav-settings', category: 'Navigation', title: 'Settings', icon: Settings, shortcut: '⌘,' },

  // AI Actions
  { id: 'ai-explain', category: 'AI Actions', title: 'Explain Code', icon: Sparkles },
  { id: 'ai-pr-review', category: 'AI Actions', title: 'Review Pull Request', icon: ShieldCheck },
  { id: 'ai-gen-tests', category: 'AI Actions', title: 'Generate Tests', icon: Zap },
  { id: 'ai-fix-bug', category: 'AI Actions', title: 'Fix Bug', icon: Bug },
  { id: 'ai-gen-docs', category: 'AI Actions', title: 'Generate Documentation', icon: FileText },
  { id: 'ai-refactor', category: 'AI Actions', title: 'Refactor Code', icon: Code },

  // Developer Actions
  { id: 'dev-search-repo', category: 'Developer Actions', title: 'Search Repository', icon: Search, shortcut: '⌘F' },
  { id: 'dev-open-file', category: 'Developer Actions', title: 'Open File', icon: FileCode, shortcut: '⌘P' },
  { id: 'dev-commits', category: 'Developer Actions', title: 'Search Commits', icon: GitCommit },
  { id: 'dev-diff', category: 'Developer Actions', title: 'View Git Diff', icon: GitBranch },
  { id: 'dev-run-tests', category: 'Developer Actions', title: 'Run Tests', icon: Play, shortcut: '⌘T' },
  { id: 'dev-terminal', category: 'Developer Actions', title: 'Open Terminal', icon: Terminal, shortcut: '⌘`' },
]

export function CommandPalette({ isOpen, onClose, onSelectAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = COMMANDS.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1))
      }
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault()
        const cmd = filteredCommands[selectedIndex]
        if (onSelectAction) onSelectAction(cmd.title)
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, query, selectedIndex, filteredCommands])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-xl bg-[#121215] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
          <Search className="size-4 text-blue-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, action, or navigate..."
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
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">No matching commands found.</div>
          ) : (
            (['Navigation', 'AI Actions', 'Developer Actions'] as const).map((cat) => {
              const categoryItems = filteredCommands.filter((c) => c.category === cat)
              if (categoryItems.length === 0) return null

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    {cat}
                  </div>
                  {categoryItems.map((cmd) => {
                    const globalIdx = filteredCommands.findIndex((item) => item.id === cmd.id)
                    const isSelected = globalIdx === selectedIndex

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          if (onSelectAction) onSelectAction(cmd.title)
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-600/20 text-white font-medium border border-blue-500/30'
                            : 'text-zinc-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <cmd.icon className={`size-4 ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`} />
                          <span>{cmd.title}</span>
                        </div>
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-800 border border-white/10 text-zinc-400">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-zinc-950/80 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">↵</kbd> Execute</span>
          </div>
          <span>Antigravity Palette</span>
        </div>
      </div>
    </div>
  )
}
