'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChatMessage, ChatMessageData } from './chat-message'
import { ChatInputArea } from './chat-input-area'
import { AttachedFile } from './attachment-manager'
import { Loader2, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface ChatWorkspaceProps {
  activeChatId?: string | null
  activeProject?: string
  activeRepo?: string
  onOpenProjects?: () => void
  onOpenRepos?: () => void
  onOpenSettings?: () => void
  onUpdateChatTitle?: (chatId: string, title: string) => void
}

export function ChatWorkspace({
  activeChatId,
  activeProject = 'AI Engineering Assistant',
  activeRepo = 'ai-engineering-assistant',
  onOpenProjects,
  onOpenRepos,
  onOpenSettings,
  onUpdateChatTitle,
}: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [systemStatus, setSystemStatus] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load messages whenever activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([])
      return
    }

    let isMounted = true

    // Attempt to load from backend if authenticated
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || localStorage.getItem('user_token'))
      : null

    if (token && activeChatId.startsWith('conv-')) {
      apiClient
        .getConversation(activeChatId)
        .then((conv) => {
          if (!isMounted) return
          if (conv && Array.isArray(conv.messages)) {
            const mapped: ChatMessageData[] = conv.messages.map((m) => ({
              id: m.id,
              role: m.sender as 'user' | 'assistant',
              content: m.content,
              timestamp: m.timestamp || 'Recently',
              references: m.references,
            }))
            setMessages(mapped)
            try {
              localStorage.setItem(`copilot_chat_messages_${activeChatId}`, JSON.stringify(mapped))
            } catch (e) {}
            return
          }
        })
        .catch(() => {
          // Fall back to local storage if backend request fails
        })
    }

    // LocalStorage fallback for guests or offline mode
    try {
      const saved = localStorage.getItem(`copilot_chat_messages_${activeChatId}`)
      if (saved) {
        const parsed: ChatMessageData[] = JSON.parse(saved)
        const cleaned = parsed.filter((m) => !m.content?.includes("charmap' codec can't encode"))
        setMessages(cleaned)
      } else {
        setMessages([])
      }
    } catch (e) {
      setMessages([])
    }

    return () => {
      isMounted = false
    }
  }, [activeChatId])

  // Global scan on mount to clean any cached charmap error messages across all stored chats
  useEffect(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('copilot_chat_messages_')) {
          const raw = localStorage.getItem(key)
          if (raw && raw.includes("charmap' codec can't encode")) {
            const parsed = JSON.parse(raw)
            const filtered = parsed.filter((m: any) => !m.content?.includes("charmap' codec can't encode"))
            localStorage.setItem(key, JSON.stringify(filtered))
          }
        }
      }
    } catch (e) {}
  }, [])

  const handleClearMessage = (id: string) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id)
      if (activeChatId) {
        try {
          localStorage.setItem(`copilot_chat_messages_${activeChatId}`, JSON.stringify(updated))
        } catch (e) {}
      }
      return updated
    })
  }

  const handleRetryMessage = async (errorMsgId: string) => {
    const errIdx = messages.findIndex((m) => m.id === errorMsgId)
    if (errIdx === -1) return

    let userQuery = ''
    for (let i = errIdx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userQuery = messages[i].content
        break
      }
    }

    handleClearMessage(errorMsgId)

    if (userQuery) {
      setSystemStatus('Retrying analysis with updated model engine...')
      try {
        const response = await apiClient.sendChatMessage(
          userQuery,
          activeRepo || 'ai-engineering-assistant',
          [],
          activeChatId || undefined
        )
        setSystemStatus(null)
        const aiReply: ChatMessageData = {
          id: crypto.randomUUID(),
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: response.reply,
          references: response.references && response.references.length > 0 ? response.references : undefined,
        }
        setMessages((prev) => [...prev, aiReply])
      } catch (e) {
        setSystemStatus(null)
      }
    }
  }

  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      try {
        localStorage.setItem(`copilot_chat_messages_${activeChatId}`, JSON.stringify(messages))
      } catch (e) {}
    }
  }, [activeChatId, messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, systemStatus])

  const handleSendMessage = async (text: string, attachments?: AttachedFile[]) => {
    let fullText = text
    if (attachments && attachments.length > 0) {
      const attNames = attachments.map((a) => a.name).join(', ')
      fullText = `${text}\n\n[Attached Files: ${attNames}]`
    }

    const userMsg: ChatMessageData = {
      id: crypto.randomUUID(),
      role: 'user',
      content: fullText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    // Auto-update chat title on first message
    if (activeChatId && onUpdateChatTitle && messages.length === 0) {
      const cleanTitle = text
        .replace(/\[Attached Files:[^\]]+\]/g, '')
        .split('\n')[0]
        .replace(/^[-*#`_> ]+/, '')
        .trim()
      if (cleanTitle) {
        const formatted = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
        const finalTitle = formatted.length > 32 ? formatted.substring(0, 30) + '...' : formatted
        onUpdateChatTitle(activeChatId, finalTitle)
        if (activeChatId.startsWith('conv-')) {
          apiClient.renameConversation(activeChatId, finalTitle).catch(() => {})
        }
      }
    }

    setMessages((prev) => [...prev, userMsg])
    setSystemStatus('Analyzing repository context & pipeline telemetry...')

    const attachedFilesPayload = (attachments || []).map((a) => ({
      fileName: a.fileName || a.name,
      content: a.content || '',
    }))

    // Query FastAPI backend with text, attached files, and active conversation ID
    try {
      const response = await apiClient.sendChatMessage(
        text,
        activeRepo || 'ai-engineering-assistant',
        attachedFilesPayload,
        activeChatId || undefined
      )
      setSystemStatus(null)

      const aiReply: ChatMessageData = {
        id: crypto.randomUUID(),
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: response.reply,
        references: response.references && response.references.length > 0 ? response.references : undefined,
      }

      setMessages((prev) => [...prev, aiReply])
    } catch (e: any) {
      setSystemStatus(null)
      const errorReply: ChatMessageData = {
        id: crypto.randomUUID(),
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `⚠️ Connection Error: Unable to complete request with the backend server (${e.message || 'Request failed'}). Make sure the backend service is running on port 8000.`,
        isError: true,
      }
      setMessages((prev) => [...prev, errorReply])
    }
  }

  return (
    <div className="flex-1 h-full min-w-0 bg-background flex flex-col justify-between overflow-hidden relative">
      {/* Active Target Repository Indicator Bar */}
      <div className="px-4 py-2 border-b border-border bg-card/60 flex items-center justify-between text-xs font-mono shrink-0 select-none">
        <div className="flex items-center gap-2 truncate">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground font-sans text-[11px]">Active Repository:</span>
          <span className="font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[11px] truncate">
            {activeRepo || 'No repository selected'}
          </span>
        </div>
        {(onOpenRepos || onOpenProjects) && (
          <button
            onClick={onOpenRepos || onOpenProjects}
            className="text-[11px] text-muted-foreground hover:text-foreground hover:underline cursor-pointer font-sans font-medium"
          >
            Switch Repository →
          </button>
        )}
      </div>

      {/* 1. Message Stream Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto divide-y divide-border/30 no-scrollbar pb-6"
      >
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[55vh] text-center px-4 space-y-3 animate-in fade-in duration-200 select-none">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                How can AI Engineering Copilot help with {activeProject || 'your project'}?
              </h2>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                Active repository: <code className="px-1.5 py-0.5 rounded bg-secondary font-mono text-primary font-semibold">{activeRepo}</code>. Ask about architecture, review pull requests, or debug code.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onClearMessage={handleClearMessage}
                onRetryMessage={handleRetryMessage}
              />
            ))
          )}

          {systemStatus && (
            <div className="py-3 px-6 my-2 mx-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150 select-none">
              <Loader2 className="size-4 animate-spin shrink-0" />
              <span>{systemStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Sticky Chat Input with 3 Suggestion Pills directly above */}
      <ChatInputArea
        onSubmit={handleSendMessage}
        onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
        activeProject={activeProject}
        activeRepo={activeRepo}
        onOpenProjects={onOpenProjects}
        onOpenRepos={onOpenRepos}
      />
    </div>
  )
}

