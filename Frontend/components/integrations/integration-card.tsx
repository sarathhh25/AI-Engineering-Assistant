'use client'

import React from 'react'
import { signIn, signOut } from 'next-auth/react'
import { ConnectionStatus, ConnectionState } from './connection-status'
import { Settings, Unplug, Sparkles, Loader2, Plus } from 'lucide-react'

export interface IntegrationTool {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: ConnectionState
  scopes: string[]
}

interface IntegrationCardProps {
  tool: IntegrationTool
  onConnectClick: (tool: IntegrationTool) => void
  onDisconnectClick: (toolId: string) => void
  onOpenSettings: (tool: IntegrationTool) => void
  isGithubConnected?: boolean
}

export function IntegrationCard({
  tool,
  onConnectClick,
  onDisconnectClick,
  onOpenSettings,
  isGithubConnected = false,
}: IntegrationCardProps) {
  const Icon = tool.icon
  const isGitHub = tool.id === 'github'
  const isConnected = isGitHub ? isGithubConnected : tool.status === 'Connected'
  const isConnecting = tool.status === 'Connecting'

  return (
    <div className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group select-none shadow-xs">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
              <Icon className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <ConnectionStatus status={isConnected ? 'Connected' : 'Disconnected'} />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {/* Scopes Tag List */}
        <div className="flex flex-wrap gap-1 pt-1">
          {tool.scopes.map((scope) => (
            <span
              key={scope}
              className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground border border-border"
            >
              {scope}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-border flex items-center gap-2">
        {isGitHub ? (
          isGithubConnected ? (
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => onOpenSettings(tool)}
                className="flex-1 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-border cursor-pointer"
              >
                <Settings className="size-3 text-muted-foreground" />
                <span>Manage GitHub Settings</span>
              </button>

              <button
                onClick={() => signOut()}
                className="py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium text-xs transition-colors border border-red-500/20 flex items-center gap-1 cursor-pointer"
                title="Disconnect GitHub"
              >
                <Unplug className="size-3" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('github')}
              className="w-full py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>+ Connect GitHub</span>
            </button>
          )
        ) : isConnected ? (
          <>
            <button
              onClick={() => onOpenSettings(tool)}
              className="flex-1 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-border cursor-pointer"
            >
              <Settings className="size-3 text-muted-foreground" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => onDisconnectClick(tool.id)}
              className="py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium text-xs transition-colors border border-red-500/20 flex items-center gap-1 cursor-pointer"
              title="Disconnect Tool"
            >
              <Unplug className="size-3" />
              <span>Disconnect</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnectClick(tool)}
            disabled={isConnecting}
            className="w-full py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isConnecting ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                <span>Connect {tool.name}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
