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
    <div className="flex-1 flex flex-col h-full bg-[#0d0d10] border border-white/10 rounded-xl overflow-hidden shadow-xl select-none font-mono text-xs">
      {/* Diff Header */}
      <div className="px-3.5 py-2 bg-zinc-900/90 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-emerald-400 shrink-0" />
          <span className="text-zinc-100 font-semibold">{filename}</span>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
            +3 / -2 lines
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="px-2 py-0.5 rounded bg-zinc-800 border border-white/5">Unified Diff</span>
        </div>
      </div>

      {/* Diff Lines Table */}
      <div className="flex-1 p-3 bg-[#08080a] overflow-x-auto text-zinc-200 font-mono text-[11px] leading-relaxed">
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
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : isRemoved
                      ? 'bg-red-500/10 text-red-300 line-through opacity-80'
                      : isHeader
                      ? 'bg-zinc-900 text-zinc-500 font-bold'
                      : 'hover:bg-white/[0.02]'
                  }
                >
                  <td className="pr-2 select-none text-right text-zinc-600 text-[10px] w-6">
                    {line.oldLine || ''}
                  </td>
                  <td className="pr-3 select-none text-right text-zinc-600 text-[10px] w-6 border-r border-white/5">
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
