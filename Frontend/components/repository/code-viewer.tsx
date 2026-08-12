'use client'

import React, { useState } from 'react'
import {
  FileCode,
  Copy,
  Check,
  Edit3,
  HelpCircle,
  Code,
  Zap,
  Sparkles,
  Plus,
  Send
} from 'lucide-react'

interface CodeViewerProps {
  filename: string
  codeContent?: string
  language?: string
  onActionTrigger?: (action: string) => void
  onSelectContext?: (filename: string) => void
  onSendToCopilot?: (filename: string) => void
}

const DEFAULT_CODE_SAMPLES: Record<string, string> = {
  'app/page.tsx': `import { AppShell } from "@/components/app-shell"

export default function Page() {
  return <AppShell />
}`,
  'backend/main.py': `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="AI Engineering Assistant Engine")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "indexed_files": 142}`,
  'package.json': `{
  "name": "ai-engineering-assistant",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`,
}

export function CodeViewer({
  filename,
  codeContent,
  language = 'typescript',
  onActionTrigger,
  onSelectContext,
  onSendToCopilot,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false)
  const code = codeContent || DEFAULT_CODE_SAMPLES[filename] || `// Code view for ${filename}\nexport function demo() {\n  return "Active file loaded";\n}`
  const lines = code.trim().split('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0d10] border border-white/10 rounded-xl overflow-hidden shadow-xl select-none font-mono">
      {/* Top Header Bar */}
      <div className="px-3.5 py-2 bg-zinc-900/90 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="size-4 text-blue-400 shrink-0" />
          <span className="text-zinc-100 font-semibold truncate">{filename}</span>
          <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 uppercase font-mono">
            {language}
          </span>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onSelectContext && onSelectContext(filename)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors"
          >
            <Plus className="size-3 text-purple-400" />
            <span>Select as Context</span>
          </button>

          <button
            onClick={() => onSendToCopilot && onSendToCopilot(filename)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition-all"
          >
            <Send className="size-3" />
            <span>Send to Copilot</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-white/5"
          >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3 text-zinc-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Container with Line Numbers */}
      <div className="flex-1 p-4 bg-[#08080a] overflow-x-auto text-zinc-200 text-xs leading-relaxed">
        <table className="w-full text-left border-collapse font-mono">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                <td className="pr-4 select-none text-right text-zinc-600 text-[11px] w-8">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-xs text-zinc-200">
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
