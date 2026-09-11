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
    <div className="w-full md:w-52 shrink-0 space-y-1 select-none font-mono text-xs md:pr-4 md:border-r border-border">
      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Settings Menu
      </div>

      {SECTIONS.map((sec) => {
        const Icon = sec.icon
        const isActive = activeSection === sec.id

        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-primary/15 text-primary border border-primary/20 font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <Icon className={`size-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>{sec.label}</span>
          </button>
        )
      })}
    </div>
  )
}
