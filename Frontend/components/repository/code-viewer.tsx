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
    <div className="flex-1 flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-xs select-none font-mono">
      {/* Top Header Bar */}
      <div className="px-3.5 py-2 bg-muted/60 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="size-4 text-primary shrink-0" />
          <span className="text-foreground font-semibold truncate">{filename}</span>
          <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md text-muted-foreground uppercase font-mono border border-border">
            {language}
          </span>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onSelectContext && onSelectContext(filename)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-colors cursor-pointer"
          >
            <Plus className="size-3 text-purple-500" />
            <span>Select as Context</span>
          </button>

          <button
            onClick={() => onSendToCopilot && onSendToCopilot(filename)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Send className="size-3" />
            <span>Send to Copilot</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border cursor-pointer"
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Container with Line Numbers */}
      <div className="flex-1 p-4 bg-muted/20 overflow-x-auto text-foreground text-xs leading-relaxed">
        <table className="w-full text-left border-collapse font-mono">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-muted/40 transition-colors">
                <td className="pr-4 select-none text-right text-muted-foreground/60 text-[11px] w-8">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-xs text-foreground">
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
