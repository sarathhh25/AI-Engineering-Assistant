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
    <div className="flex items-center gap-1 bg-secondary p-1 rounded-2xl border border-border text-xs select-none">
      {[
        { id: 'all', label: `All (${totalCount})` },
        { id: 'connected', label: `Connected (${connectedCount})` },
        { id: 'available', label: `Available (${totalCount - connectedCount})` },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectFilter(tab.id as IntegrationFilterType)}
          className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
            activeFilter === tab.id
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
