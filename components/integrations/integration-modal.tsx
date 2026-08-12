'use client'

import React, { useState } from 'react'
import { X, ShieldCheck, Check, Sparkles, Loader2 } from 'lucide-react'

export interface IntegrationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmConnect: (toolId: string) => void
  tool: {
    id: string
    name: string
    icon: React.ElementType
    scopes: string[]
  } | null
}

export function IntegrationModal({
  isOpen,
  onClose,
  onConfirmConnect,
  tool,
}: IntegrationModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  if (!isOpen || !tool) return null

  const Icon = tool.icon

  const handleConnectClick = () => {
    setIsConnecting(true)
    setTimeout(() => {
      onConfirmConnect(tool.id)
      setIsConnecting(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-[#121215] border border-white/15 rounded-xl shadow-2xl overflow-hidden text-xs flex flex-col space-y-4 p-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Icon className="size-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">Connect {tool.name}</h3>
              <p className="text-[10px] text-zinc-400">Authorization & Access Scope Request</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Permissions & Scopes List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-300 text-xs font-medium">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Requested Workspace Access Scopes:</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-2">
            {tool.scopes.map((scope) => (
              <div key={scope} className="flex items-center gap-2 text-zinc-200">
                <Check className="size-3.5 text-blue-400 shrink-0" />
                <span className="font-mono text-[11px]">{scope}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
            Antigravity Copilot will receive read and write access to synchronize metadata and vector embeddings with your active workspace.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConnectClick}
            disabled={isConnecting}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            {isConnecting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                <span>Authorize & Connect</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
