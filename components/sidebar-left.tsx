'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Search,
  Plus,
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  GitBranch,
  Bot,
  BookOpen,
  Plug,
  Settings,
  LogOut,
  User,
  Sliders,
  Coins,
  ChevronUp,
} from 'lucide-react'

export interface ChatItem {
  id: string
  title: string
  timestamp: string
  group: 'Today' | 'Yesterday' | 'This Week'
  isPinned?: boolean
}

interface SidebarProps {
  isOpen?: boolean
  setIsOpen?: (open: boolean | ((prev: boolean) => boolean)) => void
  activeNav?: string
  setActiveNav?: (nav: string) => void
  activeChatId?: string | null
  onSelectChat?: (id: string) => void
  onNewChat?: () => void
  chats?: ChatItem[]
  setChats?: (chats: ChatItem[]) => void
  aiCredits?: number
  onSearchClick?: () => void
}

const DEFAULT_CHATS: ChatItem[] = [
  { id: 'c1', title: 'Refactor Auth Middleware to FastAPI', timestamp: '10m ago', group: 'Today', isPinned: true },
  { id: 'c2', title: 'Design 2-Column Minimalist Chat Layout', timestamp: '2h ago', group: 'Today', isPinned: true },
  { id: 'c3', title: 'Optimize Qdrant RAG Vector Search', timestamp: '1d ago', group: 'Yesterday' },
  { id: 'c4', title: 'Setup Tailwind CSS v4 & Theme Tokens', timestamp: '1d ago', group: 'Yesterday' },
  { id: 'c5', title: 'Docker Multi-stage Build Pipeline', timestamp: '4d ago', group: 'This Week' },
  { id: 'c6', title: 'OpenAI Function Calling Schemas', timestamp: '5d ago', group: 'This Week' },
]

export function SidebarLeft({
  activeNav: externalActiveNav,
  setActiveNav: externalSetActiveNav,
  activeChatId: externalActiveChatId,
  onSelectChat,
  onNewChat,
  chats: externalChats,
  setChats: externalSetChats,
  aiCredits = 8450,
  onSearchClick,
}: SidebarProps) {
  const [activeNav, setActiveNav] = useState(externalActiveNav || 'chat')
  const [internalChats, setInternalChats] = useState<ChatItem[]>(DEFAULT_CHATS)
  const chats = externalChats || internalChats
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)

  const handleNavClick = (navId: string) => {
    setActiveNav(navId)
    if (externalSetActiveNav) externalSetActiveNav(navId)
  }

  const currentNav = externalActiveNav || activeNav

  return (
    <aside className="h-full w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col justify-between select-none z-30 font-sans">
      {/* 1. Top Section: Branding, Search Bar & Primary New Chat Action */}
      <div className="p-3.5 border-b border-sidebar-border space-y-3 shrink-0">
        {/* Workspace Brand Title */}
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-blue-500/25">
            <Sparkles className="size-4" />
          </div>

          <div className="flex flex-col min-w-0 truncate">
            <span className="font-bold text-xs text-sidebar-foreground tracking-tight truncate">
              AI Engineering Copilot
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              Conversational Workspace
            </span>
          </div>
        </div>

        {/* Search Workspace Bar */}
        <button
          onClick={onSearchClick}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-sidebar-accent/60 hover:bg-sidebar-accent border border-sidebar-border text-muted-foreground hover:text-sidebar-foreground transition-all text-xs group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="size-3.5 text-muted-foreground group-hover:text-sidebar-foreground" />
            <span className="text-[11px] truncate">Search workspace...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-background text-muted-foreground border border-sidebar-border shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Primary Action Button: + New Chat */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="size-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* 2. Main Navigation List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4 text-xs no-scrollbar">
        {/* Core Navigation Items */}
        <div className="space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
            Workspace
          </div>

          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'recent-chats', label: 'Recent Chats', icon: MessageSquare, badge: chats.length.toString() },
            { id: 'projects', label: 'Projects', icon: FolderKanban },
            { id: 'repositories', label: 'Repositories', icon: GitBranch },
            { id: 'agents', label: 'Agents', icon: Bot, badge: '8' },
            { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
          ].map((item) => {
            const isActive =
              currentNav === item.id ||
              (item.id === 'recent-chats' && (currentNav === 'chat' || currentNav === 'recent-chats'))
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavClick(item.id)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all group ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/25 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`size-4 shrink-0 ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-background text-muted-foreground border border-sidebar-border">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-sidebar-border my-2" />

        {/* Secondary Section: Integrations & Settings */}
        <div className="space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
            Settings & Integrations
          </div>

          {[
            { id: 'integrations', label: 'Integrations', icon: Plug },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const isActive = currentNav === item.id
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all group ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/25 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`size-4 shrink-0 ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Bottom User Profile Section */}
      <div className="p-2.5 border-t border-sidebar-border bg-sidebar relative shrink-0">
        {/* Profile Popover Menu */}
        {profilePopoverOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-popover border border-border rounded-2xl shadow-2xl p-1.5 z-50 text-xs font-sans animate-in fade-in duration-100 space-y-1 backdrop-blur-xl">
            <div className="p-2 border-b border-border space-y-0.5">
              <div className="font-semibold text-foreground">Sarath</div>
              <div className="text-[10px] text-emerald-500 font-mono">AI Engineer</div>
              <div className="text-[10px] text-amber-500 font-mono pt-1 flex items-center gap-1">
                <Coins className="size-3 text-amber-500" /> {aiCredits.toLocaleString()} AI Credits
              </div>
            </div>

            <button
              onClick={() => {
                handleNavClick('settings')
                setProfilePopoverOpen(false)
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-secondary text-foreground flex items-center gap-2 transition-colors cursor-pointer"
            >
              <User className="size-3.5 text-primary" />
              <span>Profile Preferences</span>
            </button>

            <button
              onClick={() => {
                handleNavClick('settings')
                setProfilePopoverOpen(false)
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-secondary text-foreground flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sliders className="size-3.5 text-primary" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setProfilePopoverOpen(false)
                window.location.href = '/login'
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Log out</span>
            </button>
          </div>
        )}

        {/* User Profile Trigger Button */}
        <button
          onClick={() => setProfilePopoverOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-xs">
                <div className="size-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-[10px] text-white">
                  SK
                </div>
              </div>
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
            </div>

            <div className="flex flex-col text-left min-w-0 truncate">
              <span className="font-semibold text-xs text-sidebar-foreground truncate">Sarath</span>
              <span className="text-[10px] text-muted-foreground truncate">AI Engineer</span>
            </div>
          </div>

          <ChevronUp className="size-4 text-muted-foreground group-hover:text-sidebar-foreground transition-transform shrink-0" />
        </button>
      </div>
    </aside>
  )
}
