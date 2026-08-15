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
    <div className="p-5 rounded-2xl bg-card border border-border space-y-4 select-none text-xs font-mono shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground font-sans">{agentName} Final Output</h3>
            <p className="text-[10px] text-muted-foreground">Execution Report & Code Proposal</p>
          </div>
        </div>

        {userDecision && (
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              userDecision === 'approved'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
            }`}
          >
            {userDecision === 'approved' ? '✓ Changes Approved' : '✕ Changes Rejected'}
          </span>
        )}
      </div>

      {/* 1. Reasoning Summary */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Reasoning & Execution Summary
        </div>
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-foreground leading-relaxed font-sans text-xs">
          {output.reasoningSummary}
        </div>
      </div>

      {/* 2. Files Analyzed */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <FileCode className="size-3 text-primary" /> Files Analyzed ({output.filesAnalyzed.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {output.filesAnalyzed.map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 rounded-md bg-secondary text-primary font-mono text-[10px] border border-border"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Changes Proposed (Diff View) */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Code className="size-3 text-purple-500" /> Proposed Code Modifications
        </div>
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {output.changesProposed}
        </div>
      </div>

      {/* 4. Generated Tests */}
      {output.testsGenerated && (
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <FlaskConical className="size-3 text-emerald-500" /> Synthesized Test Suite
          </div>
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {output.testsGenerated}
          </div>
        </div>
      )}

      {/* 5. Warnings / Audit Items */}
      {output.warnings && output.warnings.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="size-3" /> Audit Notices & Warnings
          </div>
          <ul className="space-y-1">
            {output.warnings.map((w, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-sans"
              >
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Decision Buttons */}
      <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => {
            if (onRetry) onRetry()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border cursor-pointer"
        >
          <RotateCcw className="size-3.5 text-muted-foreground" />
          <span>Re-run Agent</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setUserDecision('rejected')
              if (onReject) onReject()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors cursor-pointer"
          >
            <XCircle className="size-3.5" />
            <span>Reject Proposal</span>
          </button>

          <button
            onClick={() => {
              setUserDecision('approved')
              if (onApprove) onApprove()
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Approve & Apply</span>
          </button>
        </div>
      </div>
    </div>
  )
}
