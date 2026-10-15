'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  FolderGit2,
  Lock,
  Globe,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  ExternalLink,
} from 'lucide-react'
import { TopNav } from '@/components/top-nav'
import { SidebarLeft, ChatItem } from '@/components/sidebar-left'
import { WorkspaceMain } from '@/components/workspace-main'
import { CommandPalette } from '@/components/command-palette'
import { apiClient, GitHubRepositoryItem } from '@/lib/api-client'

const DEFAULT_CHATS: ChatItem[] = []

const WORKSPACE_MODULES = [
  { name: 'AI Engineering Assistant Copilot', desc: 'Core Conversational & Analysis Workspace', tag: 'Full-Stack' },
  { name: 'API Security & Rate Limiter', desc: 'Backend Architecture & Endpoints', tag: 'FastAPI' },
  { name: 'Repository Context Engine', desc: 'AST & Vector Grounding Pipeline', tag: 'TypeScript' },
  { name: 'OAuth Token Encryption & Audit', desc: 'DevOps & Identity Hardening', tag: 'Security' },
]

export function AppShell() {
  const [activeTab, setActiveTab] = useState<'chat' | 'integrations' | 'settings' | 'personalization' | string>('chat')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Master Global Workspace State
  const [activeRepo, setActiveRepo] = useState('')
  const [activeProject, setActiveProject] = useState('AI Engineering Assistant Copilot')
  const [activeAgent, setActiveAgent] = useState('Autonomous Agent')
  const [aiCredits, setAiCredits] = useState(8450)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<ChatItem[]>(DEFAULT_CHATS)

  // Real GitHub Repositories State
  const [githubRepos, setGithubRepos] = useState<GitHubRepositoryItem[]>([])
  const [reposLoading, setReposLoading] = useState(false)
  const [reposError, setReposError] = useState<string | null>(null)
  const [reposPage, setReposPage] = useState(1)
  const [reposHasNext, setReposHasNext] = useState(false)
  const [repoSearchQuery, setRepoSearchQuery] = useState('')

  // Modal dialog states
  const [dialogType, setDialogType] = useState<'projects' | 'repos' | 'agents' | 'knowledge' | null>(null)

  // Fetch real repositories from GitHub API
  const loadGitHubRepos = useCallback(async (page = 1) => {
    setReposLoading(true)
    setReposError(null)
    try {
      const res = await apiClient.getGitHubRepositories(page, 30)
      if (res && res.repositories) {
        setGithubRepos(res.repositories)
        setReposHasNext(Boolean(res.has_next))
        setReposPage(page)

        // If no activeRepo is selected yet, or activeRepo is a non-existent placeholder,
        // automatically select the first valid repository
        if (res.repositories.length > 0) {
          const savedRepo = typeof window !== 'undefined' ? localStorage.getItem('copilot_active_repo') : null
          const exists = savedRepo && res.repositories.some(
            (r) => (r.full_name || r.name).toLowerCase() === savedRepo.toLowerCase()
          )
          if (!exists) {
            const first = res.repositories[0].full_name || res.repositories[0].name
            setActiveRepo(first)
            try {
              localStorage.setItem('copilot_active_repo', first)
            } catch (e) {}
          } else if (savedRepo) {
            setActiveRepo(savedRepo)
          }
        }
      } else {
        setGithubRepos([])
        setReposHasNext(false)
      }
    } catch (err: any) {
      setReposError(err.message || 'Failed to retrieve repositories from your connected GitHub account.')
      setGithubRepos([])
      setReposHasNext(false)
    } finally {
      setReposLoading(false)
    }
  }, [])

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

    // Load initial GitHub repositories
    loadGitHubRepos(1)
  }, [loadGitHubRepos])

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
      if (activeRepo) {
        localStorage.setItem('copilot_active_repo', activeRepo)
      }
    } catch (e) {}
  }, [activeProject, activeRepo])

  // Refetch repositories whenever the repos dialog is opened
  useEffect(() => {
    if (dialogType === 'repos') {
      loadGitHubRepos(1)
      setRepoSearchQuery('')
    }
  }, [dialogType, loadGitHubRepos])

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

  // Load & Persist Chats to localStorage, and sync with backend database conversations
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('copilot_chats')
      let parsedChats: ChatItem[] = []
      if (savedChats) {
        parsedChats = JSON.parse(savedChats)
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
          repo_name: activeRepo || undefined,
        }
        const updated = [initialChat]
        setChats(updated)
        localStorage.setItem('copilot_chats', JSON.stringify(updated))
        setActiveChatId(initialChat.id)
      } else if (parsedChats.length > 0) {
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
              repo_name: c.repo_name,
            }))
            setChats(backendChats)
            setActiveChatId((prev) => {
              const selected = prev && backendChats.some((b) => b.id === prev) ? prev : backendChats[0].id
              const activeItem = backendChats.find((b) => b.id === selected)
              if (activeItem && activeItem.repo_name) {
                setActiveRepo(activeItem.repo_name)
              }
              return selected
            })
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
    if (chatId.startsWith('conv-') || !isNaN(Number(chatId))) {
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
          repo_name: activeRepo,
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
      repo_name: activeRepo,
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

  // Select a repository and enforce repository-bound conversation creation
  const handleSelectRepository = useCallback(async (r: GitHubRepositoryItem) => {
    const repoFullName = r.full_name || r.name
    setActiveRepo(repoFullName)
    try {
      localStorage.setItem('copilot_active_repo', repoFullName)
    } catch (e) {}
    setDialogType(null)

    // Notify backend about active repository selection
    apiClient.selectGitHubRepository(repoFullName).catch(() => {})

    // Enforce repository-bound conversation: Switching repositories creates a new chat session!
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || localStorage.getItem('user_token'))
      : null

    if (token) {
      try {
        const newConv = await apiClient.createConversation(r.name, repoFullName)
        const newChatObj: ChatItem = {
          id: newConv.id,
          title: newConv.title || r.name,
          timestamp: 'Just now',
          group: 'Today',
          isPinned: false,
          repo_name: repoFullName,
        }
        setChats((prev) => [newChatObj, ...prev.filter((c) => c.id !== newConv.id)])
        setActiveChatId(newConv.id)
        setActiveTab('chat')
        return
      } catch (err) {}
    }

    const localChatId = `chat-${Date.now()}`
    const newChatObj: ChatItem = {
      id: localChatId,
      title: r.name,
      timestamp: 'Just now',
      group: 'Today',
      isPinned: false,
      repo_name: repoFullName,
    }
    setChats((prev) => [newChatObj, ...prev])
    setActiveChatId(localChatId)
    setActiveTab('chat')
  }, [])

  // Filtered repositories based on modal search box
  const filteredRepos = useMemo(() => {
    if (!repoSearchQuery.trim()) return githubRepos
    const q = repoSearchQuery.toLowerCase()
    return githubRepos.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.full_name && r.full_name.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
    )
  }, [githubRepos, repoSearchQuery])

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
          // Restore bound repository for this conversation
          const existing = chats.find((c) => c.id === id)
          if (existing && existing.repo_name) {
            setActiveRepo(existing.repo_name)
            try {
              localStorage.setItem('copilot_active_repo', existing.repo_name)
            } catch (e) {}
          } else {
            apiClient.getConversation(id).then((conv) => {
              if (conv && conv.repo_name) {
                setActiveRepo(conv.repo_name)
                try {
                  localStorage.setItem('copilot_active_repo', conv.repo_name)
                } catch (e) {}
              }
            }).catch(() => {})
          }
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
          onOpenRepos={() => setDialogType('repos')}
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
          onOpenRepos={() => setDialogType('repos')}
          onSelectRepo={(repoName) => {
            const found = githubRepos.find(
              (r) => (r.full_name || r.name).toLowerCase() === repoName.toLowerCase()
            )
            if (found) {
              handleSelectRepository(found)
            } else {
              handleSelectRepository({ name: repoName, full_name: repoName, id: repoName } as any)
            }
          }}
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
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                {dialogType === 'repos' ? (
                  <FolderGit2 className="size-4 text-emerald-500" />
                ) : (
                  <FolderKanban className="size-4 text-primary" />
                )}
                <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                  {dialogType === 'repos' ? 'Select GitHub Repository' : `Select ${dialogType}`}
                </h3>
              </div>
              <button
                onClick={() => setDialogType(null)}
                className="text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-secondary cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Workspace Project Modules (Separate from GitHub Repositories) */}
            {dialogType === 'projects' && (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Select an active workspace task or project module. (This manages local workspace organization without modifying your connected GitHub repository).
                </p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {WORKSPACE_MODULES.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        setActiveProject(p.name)
                        setDialogType(null)
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        activeProject === p.name
                          ? 'bg-primary/15 border-primary/30 text-primary font-medium'
                          : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.desc}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-secondary font-mono text-muted-foreground border border-border">
                        {p.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Real GitHub Repository Selector */}
            {dialogType === 'repos' && (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Choose an authenticated GitHub repository to analyze with AI. Selecting a repository automatically creates a dedicated session bound to it.
                </p>

                {/* Search Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={repoSearchQuery}
                    onChange={(e) => setRepoSearchQuery(e.target.value)}
                    placeholder="Search your GitHub repositories..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                  />
                </div>

                {/* Loading State */}
                {reposLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2 text-xs">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span>Fetching repositories from your GitHub account...</span>
                  </div>
                ) : reposError ? (
                  /* Error & Retry State */
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center space-y-2">
                    <AlertCircle className="size-5 text-destructive mx-auto" />
                    <p className="text-xs text-destructive font-medium">{reposError}</p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        onClick={() => loadGitHubRepos(reposPage)}
                        className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <RefreshCw className="size-3" /> Retry
                      </button>
                      <button
                        onClick={() => {
                          setDialogType(null)
                          setActiveTab('integrations')
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <ExternalLink className="size-3" /> Integrations Hub
                      </button>
                    </div>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  /* Empty State */
                  <div className="py-10 text-center space-y-2">
                    <FolderGit2 className="size-8 text-muted-foreground/60 mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      {githubRepos.length === 0
                        ? 'No repositories found for this account. Ensure GitHub is connected in Integrations Hub.'
                        : 'No repositories match your search.'}
                    </p>
                    {githubRepos.length === 0 && (
                      <button
                        onClick={() => {
                          setDialogType(null)
                          setActiveTab('integrations')
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
                      >
                        Connect GitHub in Integrations
                      </button>
                    )}
                  </div>
                ) : (
                  /* Real GitHub Repositories List */
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {filteredRepos.map((r) => {
                      const fullName = r.full_name || r.name
                      const isSelected = activeRepo === fullName || activeRepo === r.name
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleSelectRepository(r)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium'
                              : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              {r.private ? (
                                <span title="Private Repository">
                                  <Lock className="size-3 text-amber-500 shrink-0" />
                                </span>
                              ) : (
                                <span title="Public Repository">
                                  <Globe className="size-3 text-blue-400 shrink-0" />
                                </span>
                              )}
                              <span className="font-mono font-semibold text-xs truncate">{fullName}</span>
                            </div>
                            {r.description && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-sm">
                                {r.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                              <span>{r.language || 'Code'}</span>
                              <span>•</span>
                              <span>{r.default_branch || 'main'}</span>
                              <span>•</span>
                              <span>{r.private ? 'Private' : 'Public'}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px] shrink-0">
                              <Check className="size-3.5" /> Active
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                {(reposPage > 1 || reposHasNext) && (
                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <button
                      disabled={reposPage <= 1}
                      onClick={() => loadGitHubRepos(reposPage - 1)}
                      className="px-2.5 py-1 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="size-3" /> Previous
                    </button>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Page {reposPage}
                    </span>
                    <button
                      disabled={!reposHasNext}
                      onClick={() => loadGitHubRepos(reposPage + 1)}
                      className="px-2.5 py-1 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="size-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Agent Selector Modal */}
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
                      activeAgent === a.name
                        ? 'bg-primary/15 border-primary/30 text-primary font-medium'
                        : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground">{a.role}</div>
                    </div>
                    {activeAgent === a.name && <span className="text-emerald-500 font-bold">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
