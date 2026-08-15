'use client'

import React, { useState } from 'react'
import { Check, Copy, FileCode } from 'lucide-react'

interface CodeBlockProps {
  language?: string
  filename?: string
  code: string
}

export function CodeBlock({ language = 'typescript', filename, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.trim().split('\n')

  return (
    <div className="my-3 rounded-xl border border-border bg-card overflow-hidden shadow-sm font-mono text-xs select-none">
      {/* Header Bar */}
      <div className="px-3.5 py-1.5 bg-muted/60 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="size-3.5 text-primary shrink-0" />
          <span className="text-foreground font-medium text-[11px]">
            {filename || `example.${language === 'python' ? 'py' : 'ts'}`}
          </span>
          <span className="text-[9px] uppercase font-semibold text-muted-foreground bg-secondary px-1.5 py-0.2 rounded border border-border">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="p-3 bg-muted/20 overflow-x-auto text-foreground leading-relaxed font-mono">
        <table className="w-full text-left border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-muted/40 transition-colors">
                <td className="pr-4 select-none text-right text-muted-foreground/60 text-[10px] w-8">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-[11px] text-foreground">
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
