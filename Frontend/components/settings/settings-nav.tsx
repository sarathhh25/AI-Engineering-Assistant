'use client'

import React from 'react'
import {
  Sliders,
  Palette,
  Cpu,
  MessageSquare,
  GitBranch,
  Bell,
  ShieldCheck,
  User
} from 'lucide-react'

export type SettingsSection =
  | 'general'
  | 'appearance'
  | 'ai'
  | 'chat'
  | 'repository'
  | 'notifications'
  | 'privacy'
  | 'personalization'

interface SettingsNavProps {
  activeSection: SettingsSection
  onSelectSection: (section: SettingsSection) => void
}

const SECTIONS: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'ai', label: 'AI Engine', icon: Cpu },
  { id: 'chat', label: 'Chat & Editor', icon: MessageSquare },
  { id: 'repository', label: 'Repository', icon: GitBranch },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
  { id: 'personalization', label: 'Personalization', icon: User },
]

export function SettingsNav({ activeSection, onSelectSection }: SettingsNavProps) {
  return (
    <div className="w-48 shrink-0 space-y-1 select-none font-mono text-xs pr-4 border-r border-white/[0.08]">
      <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
        Settings Menu
      </div>

      {SECTIONS.map((sec) => {
        const Icon = sec.icon
        const isActive = activeSection === sec.id

        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
            }`}
          >
            <Icon className={`size-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
            <span>{sec.label}</span>
          </button>
        )
      })}
    </div>
  )
}
