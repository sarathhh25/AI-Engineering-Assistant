'use client'

import React, { useState } from 'react'
import { Bell, CheckCircle2, GitPullRequest, Zap, GitCommit, Check } from 'lucide-react'

export interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  read: boolean
  icon: React.ElementType
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Pull request approved', desc: 'PR #42 (App Shell Refactor) merged to main.', time: '5m ago', read: false, icon: GitPullRequest },
  { id: 'n2', title: 'Build completed', desc: 'Production build Next.js 16 passed cleanly.', time: '12m ago', read: false, icon: CheckCircle2 },
  { id: 'n3', title: 'Agent finished', desc: 'Autonomous Agent created TopNav modular components.', time: '30m ago', read: false, icon: Zap },
  { id: 'n4', title: 'New GitHub activity', desc: 'Star count increased on ai-engineering-assistant.', time: '2h ago', read: true, icon: GitCommit },
  { id: 'n5', title: 'Jira issue assigned', desc: 'AE-109: Optimize Vector RAG search latency.', time: '4h ago', read: true, icon: CheckCircle2 },
]

export function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)

  const unreadCount = items.filter((i) => !i.read).length

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors relative"
        title="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-blue-500 ring-2 ring-[#0c0c0e]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-80 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none space-y-2">
          <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Notifications ({unreadCount} unread)</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-blue-400 hover:text-blue-300 transition-colors font-normal flex items-center gap-1"
              >
                <Check className="size-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {items.map((n) => {
              const Icon = n.icon

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)))
                  }}
                  className={`p-2 rounded-lg transition-colors cursor-pointer flex items-start gap-2.5 ${
                    n.read ? 'bg-transparent text-zinc-400 opacity-70' : 'bg-zinc-900/80 text-zinc-200 border border-white/5'
                  }`}
                >
                  <Icon className={`size-4 mt-0.5 shrink-0 ${n.read ? 'text-zinc-500' : 'text-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-100">
                      <span className="truncate">{n.title}</span>
                      <span className="text-[9px] font-mono text-zinc-500 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">{n.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
