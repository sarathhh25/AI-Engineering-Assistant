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
      className={`group cursor-pointer rounded-2xl p-4 bg-card border border-border ${border} hover:bg-secondary/40 transition-all duration-200 hover:shadow-md flex flex-col justify-between space-y-3 select-none`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className={`size-8 rounded-xl bg-gradient-to-br ${color} border border-border flex items-center justify-center`}>
            <Icon className="size-4" />
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </div>
        <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
