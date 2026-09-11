'use client'

import React from 'react'
import {
  Code,
  Layers,
  GitBranch,
  GitPullRequest,
  AlertCircle,
  Terminal
} from 'lucide-react'

export interface WorkspaceTabsProps {
  activeTab: string
  onSelectTab: (tabId: string) => void
}

export const WORKSPACE_TABS = [
  { id: 'editor', label: 'Workspace Editor', icon: Code },
  { id: 'arch', label: 'Architecture Plan', icon: Layers },
  { id: 'diffs', label: 'Git Diff Viewer', icon: GitBranch, badge: '3' },
  { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, badge: '5' },
  { id: 'issues', label: 'Issues', icon: AlertCircle },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
]

export function WorkspaceTabs({ activeTab, onSelectTab }: WorkspaceTabsProps) {
  return (
    <div className="h-9 w-full bg-[#0c0c0e]/95 border-b border-white/[0.08] px-3 flex items-center justify-between text-xs select-none shrink-0 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 min-w-max">
        {WORKSPACE_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-t-md font-medium text-xs transition-all ${
                isActive
                  ? 'bg-[#09090b] text-white border-t border-x border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {tab.badge}
                </span>
              )}

              {/* Bottom active tab indicator bar */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
