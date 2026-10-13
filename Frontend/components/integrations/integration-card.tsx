'use client'

import React from 'react'
import { ConnectionStatus, ConnectionState } from './connection-status'
import { Settings, Unplug, Loader2, Plus, AlertCircle } from 'lucide-react'
import { GitHubIntegrationStatus } from '@/lib/api-client'

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
  onOpenSetupGuide?: () => void
  onDismissError?: () => void
  isGithubConnected?: boolean
  githubStatus?: GitHubIntegrationStatus | null
  githubErrorMessage?: string | null
}

export function IntegrationCard({
  tool,
  onConnectClick,
  onDisconnectClick,
  onOpenSettings,
  onOpenSetupGuide,
  onDismissError,
  isGithubConnected = false,
  githubStatus = null,
  githubErrorMessage = null,
}: IntegrationCardProps) {
  const Icon = tool.icon
  const isGitHub = tool.id === 'github'

  let effectiveStatus: ConnectionState = tool.status
  let ghUsername = githubStatus?.username

  if (isGitHub) {
    if (githubStatus?.connected || isGithubConnected) {
      effectiveStatus = 'Connected'
    } else if (githubStatus?.status === 'Connecting' || tool.status === 'Connecting') {
      effectiveStatus = 'Connecting'
    } else if (githubErrorMessage) {
      effectiveStatus = 'Error'
    } else if (githubStatus && githubStatus.configured === false) {
      effectiveStatus = 'Setup Required'
    } else if (githubStatus?.status === 'Error') {
      effectiveStatus = 'Error'
    } else {
      effectiveStatus = 'Disconnected'
    }
  }

  const isConnected = effectiveStatus === 'Connected'
  const isConnecting = effectiveStatus === 'Connecting'

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
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                {isGitHub && ghUsername && (
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                    @{ghUsername}
                  </span>
                )}
              </div>
              <ConnectionStatus status={effectiveStatus} />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {isGitHub && githubErrorMessage && effectiveStatus === 'Error' && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] flex flex-col gap-1.5 font-mono">
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0" />
                <span className="font-semibold text-[10px] uppercase tracking-wider">OAuth Configuration Needed</span>
              </div>
              {onDismissError && (
                <button
                  onClick={onDismissError}
                  className="text-muted-foreground hover:text-foreground text-[10px] cursor-pointer"
                  title="Dismiss error"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[10px] leading-relaxed break-words font-sans">{githubErrorMessage}</p>
            {onOpenSetupGuide && (
              <button
                onClick={onOpenSetupGuide}
                className="mt-0.5 text-[10px] text-primary hover:underline text-left font-sans font-semibold cursor-pointer"
              >
                View OAuth setup instructions →
              </button>
            )}
          </div>
        )}

        {isGitHub && !githubErrorMessage && effectiveStatus === 'Setup Required' && (
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] flex items-center justify-between font-mono">
            <span>OAuth credentials needed in .env</span>
            {onOpenSetupGuide && (
              <button
                onClick={onOpenSetupGuide}
                className="text-primary hover:underline cursor-pointer font-sans font-semibold shrink-0 ml-1.5"
              >
                Setup Guide →
              </button>
            )}
          </div>
        )}

        {/* Scopes Tag List */}
        <div className="flex flex-wrap gap-1 pt-1">
          {tool.scopes.map((scope) => (
            <span
              key={scope}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border"
            >
              {scope}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-border flex items-center gap-2">
        {isGitHub ? (
          isConnected ? (
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => onOpenSettings(tool)}
                className="flex-1 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-border cursor-pointer"
              >
                <Settings className="size-3 text-muted-foreground" />
                <span>Manage GitHub Settings</span>
              </button>

              <button
                onClick={() => onDisconnectClick(tool.id)}
                className="py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium text-xs transition-colors border border-red-500/20 flex items-center gap-1 cursor-pointer"
                title="Disconnect GitHub"
              >
                <Unplug className="size-3" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onConnectClick(tool)}
              disabled={isConnecting}
              className="w-full py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Connecting GitHub...</span>
                </>
              ) : effectiveStatus === 'Error' ? (
                <>
                  <Plus className="size-3.5" />
                  <span>Retry GitHub Connection</span>
                </>
              ) : effectiveStatus === 'Setup Required' ? (
                <>
                  <Plus className="size-3.5" />
                  <span>Connect GitHub</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>+ Connect GitHub</span>
                </>
              )}
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
