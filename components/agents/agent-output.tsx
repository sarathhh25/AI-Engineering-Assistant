'use client'

import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileCode,
  AlertTriangle,
  FlaskConical,
  Code,
  Sparkles
} from 'lucide-react'

export interface AgentOutputData {
  reasoningSummary: string
  filesAnalyzed: string[]
  changesProposed: string
  testsGenerated: string
  warnings: string[]
}

interface AgentOutputProps {
  agentName: string
  output: AgentOutputData
  onApprove?: () => void
  onReject?: () => void
  onRetry?: () => void
}

export function AgentOutput({
  agentName,
  output,
  onApprove,
  onReject,
  onRetry,
}: AgentOutputProps) {
  const [userDecision, setUserDecision] = useState<'approved' | 'rejected' | null>(null)

  return (
    <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-4 select-none text-xs font-mono shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-100 font-sans">{agentName} Final Output</h3>
            <p className="text-[10px] text-zinc-400">Execution Report & Code Proposal</p>
          </div>
        </div>

        {userDecision && (
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              userDecision === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {userDecision === 'approved' ? '✓ Changes Approved' : '✕ Changes Rejected'}
          </span>
        )}
      </div>

      {/* 1. Reasoning Summary */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          Reasoning & Execution Summary
        </div>
        <div className="p-3 rounded-lg bg-[#08080a] border border-white/[0.06] text-zinc-200 leading-relaxed font-sans text-xs">
          {output.reasoningSummary}
        </div>
      </div>

      {/* 2. Files Analyzed */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <FileCode className="size-3 text-blue-400" /> Files Analyzed ({output.filesAnalyzed.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {output.filesAnalyzed.map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 rounded bg-zinc-800 text-blue-400 font-mono text-[10px] border border-white/5"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Changes Proposed (Diff View) */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <Code className="size-3 text-purple-400" /> Proposed Code Modifications
        </div>
        <div className="p-3 rounded-lg bg-[#08080a] border border-white/[0.06] font-mono text-[11px] text-zinc-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {output.changesProposed}
        </div>
      </div>

      {/* 4. Tests & Warnings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <FlaskConical className="size-3" /> Generated Tests
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 font-mono text-[11px] whitespace-pre-wrap">
            {output.testsGenerated}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="size-3" /> Risk & Warnings
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 font-mono text-[11px] space-y-1">
            {output.warnings.map((w, i) => (
              <div key={i}>• {w}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Action Buttons (Approve, Reject, Retry) */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
        <button
          onClick={() => {
            if (onRetry) onRetry()
          }}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="size-3 text-amber-400" />
          <span>Retry Execution</span>
        </button>

        <button
          onClick={() => {
            setUserDecision('rejected')
            if (onReject) onReject()
          }}
          className="px-3.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <XCircle className="size-3.5" />
          <span>Reject Changes</span>
        </button>

        <button
          onClick={() => {
            setUserDecision('approved')
            if (onApprove) onApprove()
          }}
          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
        >
          <CheckCircle2 className="size-3.5" />
          <span>Approve & Merge</span>
        </button>
      </div>
    </div>
  )
}
