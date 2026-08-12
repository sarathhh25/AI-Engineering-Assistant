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
      <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
      <input
        type="text"
        placeholder="Search integrations by tool name, service, or capabilities..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900/80 border border-white/[0.08] focus:border-blue-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
      />
    </div>
  )
}
