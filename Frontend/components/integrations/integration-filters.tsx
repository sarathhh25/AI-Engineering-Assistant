'use client'

import React from 'react'

export type IntegrationFilterType = 'all' | 'connected' | 'available'

interface IntegrationFiltersProps {
  activeFilter: IntegrationFilterType
  onSelectFilter: (filter: IntegrationFilterType) => void
  connectedCount: number
  totalCount: number
}

export function IntegrationFilters({
  activeFilter,
  onSelectFilter,
  connectedCount,
  totalCount,
}: IntegrationFiltersProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/[0.08] text-xs select-none">
      {[
        { id: 'all', label: `All (${totalCount})` },
        { id: 'connected', label: `Connected (${connectedCount})` },
        { id: 'available', label: `Available (${totalCount - connectedCount})` },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectFilter(tab.id as IntegrationFilterType)}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeFilter === tab.id
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
