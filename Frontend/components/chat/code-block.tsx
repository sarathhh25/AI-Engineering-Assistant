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
    <div className="my-3 rounded-xl border border-white/10 bg-[#0c0c0e] overflow-hidden shadow-lg font-mono text-xs select-none">
      {/* Header Bar */}
      <div className="px-3.5 py-1.5 bg-zinc-900/90 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="size-3.5 text-blue-400 shrink-0" />
          <span className="text-zinc-200 font-medium text-[11px]">
            {filename || `example.${language === 'python' ? 'py' : 'ts'}`}
          </span>
          <span className="text-[9px] uppercase font-semibold text-zinc-500 bg-zinc-800 px-1.5 py-0.2 rounded border border-white/5">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
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
      <div className="p-3 bg-[#08080a] overflow-x-auto text-zinc-200 leading-relaxed font-mono">
        <table className="w-full text-left border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                <td className="pr-4 select-none text-right text-zinc-600 text-[10px] w-8">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-[11px] text-zinc-200">
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
