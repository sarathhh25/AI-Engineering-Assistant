'use client'

import React from 'react'
import { ArrowUpRight } from 'lucide-react'

export interface QuickActionCardProps {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  border: string
  onClick?: (id: string) => void
}

export function QuickActionCard({
  id,
  title,
  description,
  icon: Icon,
  color,
  border,
  onClick,
}: QuickActionCardProps) {
  return (
    <div
      onClick={() => onClick && onClick(id)}
      className={`group cursor-pointer rounded-xl p-3.5 bg-zinc-900/60 border border-white/[0.08] ${border} hover:bg-zinc-900/90 transition-all duration-200 hover:shadow-xl flex flex-col justify-between space-y-3 select-none`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className={`size-8 rounded-lg bg-gradient-to-br ${color} border border-white/10 flex items-center justify-center`}>
            <Icon className="size-4" />
          </div>
          <ArrowUpRight className="size-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </div>
        <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-[11px] text-zinc-400 leading-tight">{description}</p>
      </div>
    </div>
  )
}
