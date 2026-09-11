'use client'

import React, { useState } from 'react'
import { HelpCircle, BookOpen, Keyboard, Bug, LifeBuoy, ExternalLink } from 'lucide-react'

interface HelpMenuProps {
  onOpenShortcuts?: () => void
}

export function HelpMenu({ onOpenShortcuts }: HelpMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Help & Resources"
      >
        <HelpCircle className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Help & Documentation
          </div>

          {[
            { label: 'Documentation', icon: BookOpen, action: () => alert('Opening Docs...') },
            {
              label: 'Keyboard Shortcuts',
              icon: Keyboard,
              action: () => {
                if (onOpenShortcuts) onOpenShortcuts()
                else alert('Shortcuts: ⌘K Search, ⌘B Sidebar, ⌘I Context, ⌘J Console')
              },
            },
            { label: 'Report Issue', icon: Bug, action: () => alert('Opening Issue Tracker...') },
            { label: 'Contact Support', icon: LifeBuoy, action: () => alert('Opening Support Chat...') },
          ].map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                onClick={() => {
                  item.action()
                  setOpen(false)
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-zinc-400" />
                  <span>{item.label}</span>
                </div>
                <ExternalLink className="size-3 text-zinc-600" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
