'use client'

import React, { useState } from 'react'
import {
  User,
  CreditCard,
  Building2,
  Sliders,
  Settings,
  Keyboard,
  LogOut,
  ChevronDown
} from 'lucide-react'

export function UserMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all group"
      >
        <div className="size-7 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm shrink-0">
          <div className="size-full rounded-full bg-zinc-900 flex items-center justify-center font-semibold text-[11px] text-white">
            SK
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-[#121215] border border-white/10 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none space-y-0.5">
          {/* User Info Header */}
          <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
            <div className="font-semibold text-zinc-100">Sunka AI</div>
            <div className="text-[10px] text-zinc-400 font-mono truncate">sunka@antigravity.ai</div>
          </div>

          {[
            { label: 'Profile', icon: User },
            { label: 'Account', icon: CreditCard },
            { label: 'Workspace', icon: Building2 },
            { label: 'Preferences', icon: Sliders },
            { label: 'Settings', icon: Settings },
            { label: 'Keyboard Shortcuts', icon: Keyboard },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={() => {
                  alert(`Navigating to ${item.label}`)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Icon className="size-3.5 text-zinc-400" />
                <span>{item.label}</span>
              </button>
            )
          })}

          <div className="pt-1 border-t border-white/[0.08]">
            <button
              onClick={() => {
                alert('Logged out')
                setOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="size-3.5 text-red-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
