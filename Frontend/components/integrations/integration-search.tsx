'use client'

import React from 'react'
import { Search } from 'lucide-react'

interface IntegrationSearchProps {
  value: string
  onChange: (value: string) => void
}

export function IntegrationSearch({ value, onChange }: IntegrationSearchProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search integrations by tool name, service, or capabilities..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary/60 border border-border focus:border-primary/50 rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
      />
    </div>
  )
}
