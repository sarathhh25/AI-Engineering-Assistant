'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { InsightCard, InsightItem } from './insight-card'

const INSIGHTS: InsightItem[] = [
  { id: 'i1', text: '3 pull requests may need review.', severity: 'Warning', actionLabel: 'Review' },
  { id: 'i2', text: '2 dependencies have available security updates.', severity: 'Alert', actionLabel: 'Fix' },
  { id: 'i3', text: 'Authentication module has low test coverage.', severity: 'Info', actionLabel: 'Analyze' },
  { id: 'i4', text: 'Google Maps repository has 4 optimization opportunities.', severity: 'Info', actionLabel: 'View' },
]

interface AIInsightsProps {
  onInsightAction?: (insight: InsightItem) => void
}

export function AIInsights({ onInsightAction }: AIInsightsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-blue-400" /> AI Insights
        </h2>
        <span className="text-zinc-500 text-[10px]">Smart Telemetry</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INSIGHTS.map((insight) => (
          <InsightCard key={insight.id} insight={insight} onAction={onInsightAction} />
        ))}
      </div>
    </div>
  )
}
