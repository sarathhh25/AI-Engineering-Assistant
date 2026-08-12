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
        <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
        <input
          type="text"
          placeholder={`Search repository by ${category}...`}
          value={query}
          onChange={handleChange}
          className="w-full bg-zinc-900/80 border border-white/[0.08] focus:border-blue-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-4 gap-1 p-0.5 bg-zinc-900/80 rounded-lg border border-white/5 text-[11px]">
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
              className={`py-1 rounded-md flex items-center justify-center gap-1 font-medium transition-all ${
                isActive ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
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
