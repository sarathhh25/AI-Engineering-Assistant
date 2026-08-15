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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden text-xs flex flex-col space-y-4 p-5"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Icon className="size-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Connect {tool.name}</h3>
              <p className="text-[10px] text-muted-foreground">Authorization & Access Scope Request</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Permissions & Scopes List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-foreground text-xs font-medium">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Requested Workspace Access Scopes:</span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-2">
            {tool.scopes.map((scope) => (
              <div key={scope} className="flex items-center gap-2 text-foreground">
                <Check className="size-3.5 text-primary shrink-0" />
                <span className="font-mono text-[11px]">{scope}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
            Antigravity Copilot will receive read and write access to synchronize metadata and vector embeddings with your active workspace.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConnectClick}
            disabled={isConnecting}
            className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isConnecting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Connecting...</span>
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
