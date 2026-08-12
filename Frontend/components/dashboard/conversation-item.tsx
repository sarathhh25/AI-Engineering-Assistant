'use client'

import React from 'react'
import { MessageSquare, FolderGit2, ArrowRight } from 'lucide-react'

export interface ConversationItemData {
  id: string
  title: string
  repo: string
  timestamp: string
}

interface ConversationItemProps {
  chat: ConversationItemData
  onSelect?: (chat: ConversationItemData) => void
}

export function ConversationItem({ chat, onSelect }: ConversationItemProps) {
  return (
    <div
      onClick={() => onSelect && onSelect(chat)}
      className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/20 hover:bg-zinc-900/90 transition-all cursor-pointer flex items-center justify-between group select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0 truncate">
        <div className="size-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
          <MessageSquare className="size-3.5" />
        </div>

        <div className="flex flex-col min-w-0 truncate">
          <span className="text-xs font-medium text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
            {chat.title}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <FolderGit2 className="size-2.5" /> {chat.repo}
            </span>
            <span>•</span>
            <span>{chat.timestamp}</span>
          </div>
        </div>
      </div>

      <ArrowRight className="size-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </div>
  )
}
