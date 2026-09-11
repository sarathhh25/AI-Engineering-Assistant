'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  FileCode,
  GitPullRequest,
  AlertCircle,
  FolderGit2,
  FileText,
  Kanban,
  User,
  Hash
} from 'lucide-react'

export interface MentionItem {
  id: string
  name: string
  category: 'issue' | 'pr' | 'repo' | 'file' | 'doc' | 'jira' | 'slack_user' | 'slack_channel'
  details: string
}

const MENTION_ITEMS: MentionItem[] = [
  { id: 'm1', name: '#104 Fix JWT expiration bug in Auth Middleware', category: 'issue', details: 'GitHub Issue • Open' },
  { id: 'm2', name: '#PR-42 Add Next.js 16 App Shell Layout', category: 'pr', details: 'GitHub PR • Merged' },
  { id: 'm3', name: 'ai-engineering-assistant', category: 'repo', details: 'GitHub Repository • Active' },
  { id: 'm4', name: '@Backend/main.py', category: 'file', details: 'FastAPI Entrypoint' },
  { id: 'm5', name: '@components/app-shell.tsx', category: 'file', details: 'React 19 Shell Component' },
  { id: 'm6', name: '@app/page.tsx', category: 'file', details: 'Next.js App Router Page' },
  { id: 'm7', name: '@docs/architecture.md', category: 'doc', details: 'System Design Spec' },
]

interface MentionMenuProps {
  query: string
  onSelect: (item: MentionItem) => void
  onClose: () => void
}

export function MentionMenu({ query, onSelect, onClose }: MentionMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = MENTION_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.details.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filtered.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) onSelect(filtered[selectedIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filtered, selectedIndex, onSelect, onClose])

  if (filtered.length === 0) return null

  const getCategoryIcon = (cat: MentionItem['category']) => {
    switch (cat) {
      case 'issue': return <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
      case 'pr': return <GitPullRequest className="size-3.5 text-purple-500 shrink-0" />
      case 'repo': return <FolderGit2 className="size-3.5 text-blue-500 shrink-0" />
      case 'file': return <FileCode className="size-3.5 text-emerald-500 shrink-0" />
      case 'doc': return <FileText className="size-3.5 text-sky-500 shrink-0" />
      case 'jira': return <Kanban className="size-3.5 text-indigo-500 shrink-0" />
      case 'slack_user': return <User className="size-3.5 text-pink-500 shrink-0" />
      case 'slack_channel': return <Hash className="size-3.5 text-emerald-500 shrink-0" />
    }
  }

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-4 mb-2 w-80 max-h-64 rounded-2xl bg-popover border border-border shadow-2xl p-1.5 z-40 text-xs overflow-y-auto select-none animate-in fade-in zoom-in-95 duration-100 no-scrollbar backdrop-blur-xl"
    >
      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border mb-1">
        <span>Mentions & References</span>
        <span className="font-mono text-[9px]">↑↓ to navigate</span>
      </div>

      {filtered.map((item, idx) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
            idx === selectedIndex ? 'bg-primary/15 text-primary font-medium' : 'text-foreground hover:bg-secondary'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            {getCategoryIcon(item.category)}
            <span className="truncate text-xs font-mono">{item.name}</span>
          </div>
          <span className="text-[9px] text-muted-foreground font-mono shrink-0 ml-2">{item.details}</span>
        </button>
      ))}
    </div>
  )
}
