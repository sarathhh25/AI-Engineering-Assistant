'use client'

import React from 'react'
import { ConversationItem, ConversationItemData } from './conversation-item'

const CONVERSATIONS: ConversationItemData[] = [
  { id: 'c1', title: 'Explain the authentication flow', repo: 'ai-engineering-assistant', timestamp: '10m ago' },
  { id: 'c2', title: 'Why is Sprint 14 delayed?', repo: 'CuriousBees', timestamp: '1h ago' },
  { id: 'c3', title: 'Review the latest pull request', repo: 'ai-engineering-assistant', timestamp: '2h ago' },
  { id: 'c4', title: 'Optimize Google Maps route algorithm', repo: 'Google_maps', timestamp: '4h ago' },
  { id: 'c5', title: 'Generate tests for FastAPI endpoints', repo: 'ai-engineering-assistant', timestamp: '1d ago' },
  { id: 'c6', title: 'Explain repository architecture', repo: 'Financial-Tracker', timestamp: '2d ago' },
]

interface RecentConversationsProps {
  onSelectConversation?: (item: ConversationItemData) => void
}

export function RecentConversations({ onSelectConversation }: RecentConversationsProps) {
  const handleSelect = (chat: ConversationItemData) => {
    if (onSelectConversation) onSelectConversation(chat)
    else alert(`Opening chat: ${chat.title}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
          Recent Conversations
        </h2>
        <span className="text-zinc-500 text-[10px]">AI Sessions</span>
      </div>

      <div className="space-y-1.5">
        {CONVERSATIONS.map((chat) => (
          <ConversationItem key={chat.id} chat={chat} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}
