'use client'

import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export interface InsightItem {
  id: string
  text: string
  severity: 'Warning' | 'Alert' | 'Info'
  actionLabel: string
}

interface InsightCardProps {
  insight: InsightItem
  onAction?: (insight: InsightItem) => void
}

export function InsightCard({ insight, onAction }: InsightCardProps) {
  return (
    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-3 group select-none">
      <div className="flex items-start gap-2.5">
        <div className="size-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
          <Sparkles className="size-3.5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                insight.severity === 'Alert'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : insight.severity === 'Warning'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {insight.severity}
            </span>
          </div>
          <p className="text-xs text-zinc-200 font-medium leading-snug group-hover:text-blue-300 transition-colors">
            {insight.text}
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-end">
        <button
          onClick={() => {
            if (onAction) onAction(insight)
            else alert(`Triggered action: ${insight.actionLabel}`)
          }}
          className="px-3 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
        >
          <span>{insight.actionLabel}</span>
          <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  )
}
