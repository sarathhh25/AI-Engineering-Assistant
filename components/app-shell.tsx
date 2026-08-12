'use client'

import React, { useState, useEffect } from 'react'
import { TopNav } from '@/components/top-nav'
import { SidebarLeft, ChatItem } from '@/components/sidebar-left'
import { WorkspaceMain } from '@/components/workspace-main'
import { CommandPalette } from '@/components/command-palette'

const DEFAULT_CHATS: ChatItem[] = [
  { id: 'c1', title: 'Refactor Auth Middleware to FastAPI', timestamp: '10m ago', group: 'Today', isPinned: true },
  { id: 'c2', title: 'Design 2-Column Minimalist Chat Layout', timestamp: '2h ago', group: 'Today', isPinned: true },
  { id: 'c3', title: 'Optimize Qdrant RAG Vector Search', timestamp: '1d ago', group: 'Yesterday' },
  { id: 'c4', title: 'Setup Tailwind CSS v4 & Theme Tokens', timestamp: '1d ago', group: 'Yesterday' },
  { id: 'c5', title: 'Docker Multi-stage Build Pipeline', timestamp: '4d ago', group: 'This Week' },
  { id: 'c6', title: 'OpenAI Function Calling Schemas', timestamp: '5d ago', group: 'This Week' },
]

export function AppShell() {
  const [activeTab, setActiveTab] = useState<'chat' | 'integrations' | 'settings' | 'personalization' | string>('chat')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Master Global Workspace State
  const [activeRepo, setActiveRepo] = useState('ai-engineering-assistant')
  const [activeProject, setActiveProject] = useState('AI Engineering Assistant')
  const [activeAgent, setActiveAgent] = useState('Autonomous Agent')
  const [aiCredits, setAiCredits] = useState(8450)
  const [activeChatId, setActiveChatId] = useState<string | null>('c1')
  const [chats, setChats] = useState<ChatItem[]>(DEFAULT_CHATS)

  // Modal dialog states
  const [dialogType, setDialogType] = useState<'projects' | 'repos' | 'agents' | 'knowledge' | null>(null)

  // Load & Persist Chats to localStorage
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('copilot_chats')
      if (savedChats) {
        setChats(JSON.parse(savedChats))
      }
      const savedCredits = localStorage.getItem('copilot_credits')
      if (savedCredits) {
        setAiCredits(Number(savedCredits))
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

  const handleNewChat = () => {
    const newChatObj: ChatItem = {
      id: `chat-${Date.now()}`,
      title: 'New Engineering Chat',
      timestamp: 'Just now',
      group: 'Today',
      isPinned: false,
    }
    const updated = [newChatObj, ...chats]
    updateChatsAndSave(updated)
    setActiveChatId(newChatObj.id)
    setActiveTab('chat')
  }

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
  }, [commandPaletteOpen, dialogType])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans select-none antialiased">
      {/* Column 1: Left Fixed-Width Sidebar (Always Expanded) */}
      <SidebarLeft
        activeNav={activeTab}
        setActiveNav={(nav) => {
          if (nav === 'projects' || nav === 'repositories' || nav === 'agents' || nav === 'knowledge-base') {
            setDialogType(nav === 'knowledge-base' ? 'knowledge' : (nav as any))
          } else if (nav === 'dashboard' || nav === 'recent-chats') {
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
            activeTab === 'integrations'
              ? 'Integrations & Tools'
              : activeTab === 'settings'
              ? 'Settings & Preferences'
              : 'Conversational Workspace'
          }
          onOpenSettings={() => setActiveTab('settings')}
        />

        {/* Central Chat / View Interface */}
        <WorkspaceMain
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeChatId={activeChatId}
          onOpenSettings={() => setActiveTab('settings')}
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
              <div className="space-y-2">
                {[
                  { id: 'ai-engineering-assistant', lang: 'TypeScript', updated: '2m ago' },
                  { id: 'Google_maps', lang: 'Python', updated: '1h ago' },
                  { id: 'CuriousBees', lang: 'Python', updated: '3h ago' },
                  { id: 'Financial-Tracker', lang: 'Python', updated: '1d ago' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRepo(r.id)
                      setDialogType(null)
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                      activeRepo === r.id ? 'bg-primary/15 border-primary/30 text-primary font-medium' : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-semibold">{r.id}</div>
                      <div className="text-[10px] text-muted-foreground">{r.lang} • Updated {r.updated}</div>
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
