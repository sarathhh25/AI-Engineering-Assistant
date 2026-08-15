'use client'

import React, { useState } from 'react'
import { Search, FileCode, Code, Hash, GitCommit } from 'lucide-react'

export type SearchCategory = 'files' | 'code' | 'symbols' | 'commits'

interface RepositorySearchProps {
  onSearch?: (query: string, category: SearchCategory) => void
}

export function RepositorySearch({ onSearch }: RepositorySearchProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SearchCategory>('files')

  const categories: { id: SearchCategory; label: string; icon: React.ElementType }[] = [
    { id: 'files', label: 'Files', icon: FileCode },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'symbols', label: 'Symbols', icon: Hash },
    { id: 'commits', label: 'Commits', icon: GitCommit },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (onSearch) onSearch(e.target.value, category)
  }

  return (
    <div className="space-y-2 select-none">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search repository by ${category}...`}
          value={query}
          onChange={handleChange}
          className="w-full bg-secondary/60 border border-border focus:border-primary/50 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-4 gap-1 p-0.5 bg-secondary rounded-xl border border-border text-[11px]">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = category === cat.id

          return (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id)
                if (onSearch) onSearch(query, cat.id)
              }}
              className={`py-1 rounded-lg flex items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
                isActive ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-3" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
