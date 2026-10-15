'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TopNav } from '@/components/top-nav'
import { SidebarLeft, ChatItem } from '@/components/sidebar-left'
import { WorkspaceMain } from '@/components/workspace-main'
import { CommandPalette } from '@/components/command-palette'
import { apiClient } from '@/lib/api-client'

const DEFAULT_CHATS: ChatItem[] = []

export function AppShell() {
  const [activeTab, setActiveTab] = useState<'chat' | 'integrations' | 'settings' | 'personalization' | string>('chat')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Master Global Workspace State
  const [activeRepo, setActiveRepo] = useState('ai-engineering-assistant')
  const [activeProject, setActiveProject] = useState('AI Engineering Assistant')
  const [activeAgent, setActiveAgent] = useState('Autonomous Agent')
  const [aiCredits, setAiCredits] = useState(8450)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<ChatItem[]>(DEFAULT_CHATS)
  const [availableRepos, setAvailableRepos] = useState<Array<{ id: string; name: string; lang: string; updated: string }>>([])

  // Modal dialog states
  const [dialogType, setDialogType] = useState<'projects' | 'repos' | 'agents' | 'knowledge' | null>(null)

  // Restore saved activeTab, activeProject, and activeRepo on client mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const queryTab = urlParams.get('tab')
      const hasGitHubCallback = urlParams.has('github_status') || urlParams.has('github_error')

      if (queryTab) {
        setActiveTab(queryTab)
      } else if (hasGitHubCallback) {
        setActiveTab('integrations')
      } else {
        const saved = localStorage.getItem('copilot_active_tab')
        if (saved && saved !== 'dashboard') {
          setActiveTab(saved)
        } else {
          setActiveTab('chat')
        }
      }

      const savedProject = localStorage.getItem('copilot_active_project')
      if (savedProject) setActiveProject(savedProject)
      const savedRepo = localStorage.getItem('copilot_active_repo')
      if (savedRepo) setActiveRepo(savedRepo)
    } catch (e) {}
  }, [])

  // Persist activeTab whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('copilot_active_tab', activeTab)
    } catch (e) {}
  }, [activeTab])

  // Persist activeProject and activeRepo whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('copilot_active_project', activeProject)
      localStorage.setItem('copilot_active_repo', activeRepo)
    } catch (e) {}
  }, [activeProject, activeRepo])

  // Load real repositories from GitHub API when repos dialog opens
  useEffect(() => {
    if (dialogType === 'repos') {
      apiClient
        .getGitHubRepositories(1, 50)
        .then((res) => {
          if (res.repositories && res.repositories.length > 0) {
            const mapped = res.repositories.map((r) => ({
              id: r.full_name || r.name,
              name: r.full_name || r.name,
              lang: r.language || 'Code',
              updated: r.private ? 'Private' : 'Public',
            }))
            setAvailableRepos(mapped)
          }
        })
        .catch(() => {})
    }
  }, [dialogType])

  // Helper to derive a clean, readable title from the first message
  const deriveTitleFromMessage = (text: string): string => {
    const clean = text
      .replace(/\[Attached Files:[^\]]+\]/g, '')
      .split('\n')[0]
      .replace(/^[-*#`_> ]+/, '')
      .trim()
    if (!clean) return 'Engineering Chat'
    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1)
    return formatted.length > 32 ? formatted.substring(0, 30) + '...' : formatted
  }

  // Load & Persist Chats to localStorage, and auto-title existing chats
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('copilot_chats')
      let parsedChats: ChatItem[] = []
      if (savedChats) {
        parsedChats = JSON.parse(savedChats)
        // Automatically migrate any 'New Engineering Chat' that already has messages
        let hasChanges = false
        parsedChats = parsedChats.map((c) => {
          if (c.title === 'New Engineering Chat') {
            try {
              const savedMsgs = localStorage.getItem(`copilot_chat_messages_${c.id}`)
              if (savedMsgs) {
                const msgs = JSON.parse(savedMsgs)
                const firstUser = msgs.find((m: any) => m.role === 'user')?.content
                if (firstUser) {
                  hasChanges = true
                  return {
                    ...c,
                    title: deriveTitleFromMessage(firstUser),
                  }
                }
              }
            } catch (err) {}
          }
          return c
        })
        if (hasChanges) {
          localStorage.setItem('copilot_chats', JSON.stringify(parsedChats))
        }
        setChats(parsedChats)
      }
      const savedCredits = localStorage.getItem('copilot_credits')
      if (savedCredits) {
        setAiCredits(Number(savedCredits))
      }

      // If no chats exist yet (first-time launch), create a default new chat
      if (!savedChats || parsedChats.length === 0) {
        const initialChat: ChatItem = {
          id: `chat-${Date.now()}`,
          title: 'Engineering Chat',
          timestamp: 'Just now',
          group: 'Today',
          isPinned: false,
        }
        const updated = [initialChat]
        setChats(updated)
        localStorage.setItem('copilot_chats', JSON.stringify(updated))
        setActiveChatId(initialChat.id)
      } else if (parsedChats.length > 0) {
        // Default to the first chat in the list if one exists
        setActiveChatId(parsedChats[0].id)
      }

      // If user is authenticated, sync with backend database conversations
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('token') || localStorage.getItem('user_token'))
        : null
      if (token) {
        apiClient.getConversations().then((res) => {
          if (res && res.length > 0) {
            const backendChats: ChatItem[] = res.map((c) => ({
              id: c.id,
              title: c.title,
              timestamp: 'Recently',
              group: 'Today',
              isPinned: false,
            }))
            setChats(backendChats)
            setActiveChatId((prev) =>
              prev && backendChats.some((b) => b.id === prev) ? prev : backendChats[0].id
            )
          }
        }).catch(() => {})
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e)
    }
  }, [])

  const updateChatsAndSave = (newChats: ChatItem[]) => {
    setChats(newChats)
    try {
      localStorage.setItem('copilot_chats', JSON.stringify(newChats))
    } catch (e) {
      console.error('Failed to save chats:', e)
    }
  }

  const handleUpdateChatTitle = useCallback((chatId: string, title: string) => {
    setChats((prev) => {
      const updated = prev.map((c) => (c.id === chatId ? { ...c, title } : c))
      try {
        localStorage.setItem('copilot_chats', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
    if (chatId.startsWith('conv-')) {
      apiClient.renameConversation(chatId, title).catch(() => {})
    }
  }, [])

  const handleNewChat = useCallback(async () => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || localStorage.getItem('user_token'))
      : null

    if (token) {
      try {
        const newConv = await apiClient.createConversation('Engineering Chat', activeRepo)
        const newChatObj: ChatItem = {
          id: newConv.id,
          title: newConv.title || 'Engineering Chat',
          timestamp: 'Just now',
          group: 'Today',
          isPinned: false,
        }
        setChats((prev) => [newChatObj, ...prev])
        setActiveChatId(newConv.id)
        setActiveTab('chat')
        return
      } catch (e) {}
    }

    const newChatObj: ChatItem = {
      id: `chat-${Date.now()}`,
      title: 'Engineering Chat',
      timestamp: 'Just now',
      group: 'Today',
      isPinned: false,
    }
    setChats((prev) => {
      const updated = [newChatObj, ...prev]
      try {
        localStorage.setItem('copilot_chats', JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save chats:', e)
      }
      return updated
    })
    setActiveChatId(newChatObj.id)
    setActiveTab('chat')
  }, [activeRepo])

  // Global Keyboard Shortcuts (⌘K, ⌘N, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handleNewChat()
      } else if (e.key === 'Escape') {
        if (commandPaletteOpen) setCommandPaletteOpen(false)
        if (dialogType) setDialogType(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, dialogType, handleNewChat])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans select-none antialiased">
      {/* Column 1: Left Fixed-Width Sidebar (Always Expanded) */}
      <SidebarLeft
        activeNav={activeTab}
        activeProject={activeProject}
        activeRepo={activeRepo}
        onOpenProjects={() => setDialogType('projects')}
        onOpenRepos={() => setDialogType('repos')}
        setActiveNav={(nav) => {
          if (nav === 'projects' || nav === 'knowledge-base') {
            setDialogType(nav === 'knowledge-base' ? 'knowledge' : (nav as any))
          } else if (nav === 'recent-chats') {
            setActiveTab('chat')
          } else {
            setActiveTab(nav as any)
          }
        }}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id)
          setActiveTab('chat')
        }}
        onNewChat={handleNewChat}
        chats={chats}
        setChats={updateChatsAndSave}
        aiCredits={aiCredits}
        onSearchClick={() => setCommandPaletteOpen(true)}
      />

      {/* Column 2: Center Workspace (Full remaining width, flex-1) */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header for Center Workspace */}
        <TopNav
          activeTabTitle={
            activeTab === 'dashboard'
              ? 'Engineering Dashboard'
              : activeTab === 'agents'
              ? 'Autonomous AI Agents'
              : activeTab === 'repositories'
              ? 'Repository Explorer'
              : activeTab === 'integrations'
              ? 'Integrations & Tools'
              : activeTab === 'settings'
              ? 'Settings & Preferences'
              : 'Conversational Workspace'
          }
          activeProject={activeProject}
          activeRepo={activeRepo}
          onOpenProjects={() => setDialogType('projects')}
          onOpenSettings={() => setActiveTab('settings')}
        />

        {/* Central Chat / View Interface */}
        <WorkspaceMain
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeChatId={activeChatId}
          activeProject={activeProject}
          activeRepo={activeRepo}
          onOpenProjects={() => setDialogType('projects')}
          onOpenSettings={() => setActiveTab('settings')}
          onUpdateChatTitle={handleUpdateChatTitle}
        />
      </div>

      {/* Command Palette Modal (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectModel={() => {}}
        onSelectFile={() => {}}
      />

      {/* Interactive Selection Dialogs (Projects, Repos, Agents, Knowledge Base) */}
      {dialogType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 text-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                Select {dialogType}
              </h3>
              <button
                onClick={() => setDialogType(null)}
                className="text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-secondary"
              >
                ✕
              </button>
            </div>

            {dialogType === 'projects' && (
              <div className="space-y-2">
                {[
                  { name: 'AI Engineering Assistant', repo: 'ai-engineering-assistant', lang: 'TypeScript' },
                  { name: 'Google Maps Route Optimizer', repo: 'Google_maps', lang: 'Python' },
                  { name: 'CuriousBees', repo: 'CuriousBees', lang: 'Python' },
                  { name: 'Financial Tracker', repo: 'Financial-Tracker', lang: 'Python' },
                ].map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setActiveProject(p.name)
                      setActiveRepo(p.repo)
                      setDialogType(null)
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                      activeProject === p.name ? 'bg-primary/15 border-primary/30 text-primary font-medium' : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{p.repo} • {p.lang}</div>
                    </div>
                    {activeProject === p.name && <span className="text-emerald-500 font-bold">Active</span>}
                  </button>
                ))}
              </div>
            )}

            {dialogType === 'repos' && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {/* Local Workspace Option */}
                <button
                  key="ai-engineering-assistant"
                  onClick={() => {
                    setActiveRepo('ai-engineering-assistant')
                    apiClient.selectGitHubRepository('ai-engineering-assistant').catch(() => {})
                    setDialogType(null)
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                    activeRepo === 'ai-engineering-assistant' ? 'bg-primary/15 border-primary/30 text-primary font-medium' : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  <div>
                    <div className="font-mono font-semibold">ai-engineering-assistant</div>
                    <div className="text-[10px] text-muted-foreground">TypeScript / Python • Local Workspace</div>
                  </div>
                  {activeRepo === 'ai-engineering-assistant' && <span className="text-emerald-500 font-bold">Active</span>}
                </button>

                {/* Real Remote Repositories */}
                {availableRepos.filter((r) => r.id !== 'ai-engineering-assistant').map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRepo(r.id)
                      apiClient.selectGitHubRepository(r.id).catch(() => {})
                      setDialogType(null)
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      activeRepo === r.id ? 'bg-primary/15 border-primary/30 text-primary font-medium' : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-semibold">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.lang} • {r.updated}</div>
                    </div>
                    {activeRepo === r.id && <span className="text-emerald-500 font-bold">Active</span>}
                  </button>
                ))}
              </div>
            )}

            {dialogType === 'agents' && (
              <div className="space-y-2">
                {[
                  { name: 'Autonomous Agent', role: 'Full repository execution & refactoring' },
                  { name: 'Code Review Agent', role: 'Automated PR review & security analysis' },
                  { name: 'Architect Agent', role: 'System design & schema generation' },
                ].map((a) => (
                  <button
                    key={a.name}
                    onClick={() => {
                      setActiveAgent(a.name)
                      setDialogType(null)
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                      activeAgent === a.name ? 'bg-primary/15 border-primary/30 text-primary font-medium' : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground">{a.role}</div>
                    </div>
                    {activeAgent === a.name && <span className="text-emerald-500 font-bold">Selected</span>}
                  </button>
                ))}
              </div>
            )}

            {dialogType === 'knowledge' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search indexed vector embeddings and documents..."
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs text-foreground outline-none"
                />
                <div className="space-y-1.5 font-mono text-[11px] text-foreground max-h-48 overflow-y-auto">
                  <div className="p-2 bg-secondary/60 rounded border border-border">📄 Architecture RFC (142 embeddings indexed)</div>
                  <div className="p-2 bg-secondary/60 rounded border border-border">📄 FastAPI Authentication Guide</div>
                  <div className="p-2 bg-secondary/60 rounded border border-border">📄 Next.js App Shell Layout Specs</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
