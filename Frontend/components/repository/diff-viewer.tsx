'use client'

import React from 'react'
import { GitBranch, FileCode, Plus, Minus, Check } from 'lucide-react'

interface DiffViewerProps {
  filename?: string
}

const DEMO_DIFF_LINES = [
  { type: 'header', content: '@@ -1,8 +1,12 @@ main branch diff' },
  { type: 'context', oldLine: 1, newLine: 1, content: 'import React from "react"' },
  { type: 'removed', oldLine: 2, newLine: null, content: '- import { ChatAssistant } from "@/components/chat-assistant"' },
  { type: 'added', oldLine: null, newLine: 2, content: '+ import { AppShell } from "@/components/app-shell"' },
  { type: 'added', oldLine: null, newLine: 3, content: '+ import { TopNav } from "@/components/top-nav"' },
  { type: 'context', oldLine: 3, newLine: 4, content: '' },
  { type: 'context', oldLine: 4, newLine: 5, content: 'export default function Page() {' },
  { type: 'removed', oldLine: 5, newLine: null, content: '-   return <ChatAssistant />' },
  { type: 'added', oldLine: null, newLine: 6, content: '+   return <AppShell />' },
  { type: 'context', oldLine: 6, newLine: 7, content: '}' },
]

export function DiffViewer({ filename = 'app/page.tsx' }: DiffViewerProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-xs select-none font-mono text-xs">
      {/* Diff Header */}
      <div className="px-3.5 py-2 bg-muted/60 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-emerald-500 shrink-0" />
          <span className="text-foreground font-semibold">{filename}</span>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20 font-bold">
            +3 / -2 lines
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">Unified Diff</span>
        </div>
      </div>

      {/* Diff Lines Table */}
      <div className="flex-1 p-3 bg-muted/20 overflow-x-auto text-foreground font-mono text-[11px] leading-relaxed">
        <table className="w-full text-left border-collapse font-mono">
          <tbody>
            {DEMO_DIFF_LINES.map((line, idx) => {
              const isAdded = line.type === 'added'
              const isRemoved = line.type === 'removed'
              const isHeader = line.type === 'header'

              return (
                <tr
                  key={idx}
                  className={
                    isAdded
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium'
                      : isRemoved
                      ? 'bg-red-500/15 text-red-700 dark:text-red-300 line-through opacity-80'
                      : isHeader
                      ? 'bg-secondary text-muted-foreground font-bold'
                      : 'hover:bg-muted/40'
                  }
                >
                  <td className="pr-2 select-none text-right text-muted-foreground/60 text-[10px] w-6">
                    {line.oldLine || ''}
                  </td>
                  <td className="pr-3 select-none text-right text-muted-foreground/60 text-[10px] w-6 border-r border-border">
                    {line.newLine || ''}
                  </td>
                  <td className="pl-3 whitespace-pre font-mono text-[11px] py-0.5">
                    {line.content}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
