'use client'

import React, { useState } from 'react'
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react'

export function ThemeToggle() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')

  const applyTheme = (mode: 'dark' | 'light' | 'system') => {
    setTheme(mode)
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (mode === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-1"
        title="Theme Switcher"
      >
        {theme === 'dark' ? (
          <Moon className="size-4 text-blue-400" />
        ) : theme === 'light' ? (
          <Sun className="size-4 text-amber-400" />
        ) : (
          <Laptop className="size-4 text-zinc-400" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none">
          <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Theme Mode
          </div>

          {[
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon
            const isSelected = theme === t.id

            return (
              <button
                key={t.id}
                onClick={() => {
                  applyTheme(t.id as any)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected ? 'bg-blue-500/15 text-blue-300 font-medium' : 'text-zinc-300 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-zinc-400" />
                  <span>{t.label}</span>
                </div>
                {isSelected && <Check className="size-3 text-blue-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
