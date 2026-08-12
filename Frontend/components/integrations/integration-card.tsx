'use client'

import React from 'react'
import { ConnectionStatus, ConnectionState } from './connection-status'
import { Settings, Unplug, Sparkles, Loader2 } from 'lucide-react'

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
}

export function IntegrationCard({
  tool,
  onConnectClick,
  onDisconnectClick,
  onOpenSettings,
}: IntegrationCardProps) {
  const Icon = tool.icon
  const isConnected = tool.status === 'Connected'
  const isConnecting = tool.status === 'Connecting'

  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group select-none">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Icon className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-100 group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              <ConnectionStatus status={tool.status} />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {/* Scopes Tag List */}
        <div className="flex flex-wrap gap-1 pt-1">
          {tool.scopes.map((scope) => (
            <span
              key={scope}
              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-white/5"
            >
              {scope}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
        {isConnected ? (
          <>
            <button
              onClick={() => onOpenSettings(tool)}
              className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Settings className="size-3 text-zinc-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => onDisconnectClick(tool.id)}
              className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs transition-colors border border-red-500/20 flex items-center gap-1"
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
            className="w-full py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-blue-400" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3 text-blue-400" />
                <span>Connect {tool.name}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
