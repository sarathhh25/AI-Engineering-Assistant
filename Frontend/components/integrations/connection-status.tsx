'use client'

import React from 'react'
import { CheckCircle2, Circle, Loader2, AlertTriangle } from 'lucide-react'

export type ConnectionState = 'Connected' | 'Connecting' | 'Disconnected' | 'Error'

interface ConnectionStatusProps {
  status: ConnectionState
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  switch (status) {
    case 'Connected':
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-mono">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Connected</span>
        </div>
      )
    case 'Connecting':
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium font-mono">
          <Loader2 className="size-3 animate-spin text-blue-400" />
          <span>Connecting...</span>
        </div>
      )
    case 'Error':
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-medium font-mono">
          <AlertTriangle className="size-3 text-red-400" />
          <span>Auth Error</span>
        </div>
      )
    case 'Disconnected':
    default:
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 text-[10px] font-medium font-mono">
          <Circle className="size-2 text-zinc-500" />
          <span>Disconnected</span>
        </div>
      )
  }
}
