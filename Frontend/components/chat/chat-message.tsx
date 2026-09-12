'use client'

import React from 'react'
import { Sparkles, User, FileCode, CheckCircle2 } from 'lucide-react'
import { CodeBlock } from './code-block'
import { useUserProfile } from '@/lib/use-user-profile'

export interface ChatMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  codeSnippets?: { language: string; filename?: string; code: string }[]
  references?: string[]
  tableData?: { headers: string[]; rows: string[][] }
}

interface ChatMessageProps {
  message: ChatMessageData
}

// Formats inline markdown like **bold** and `code`
function formatInlineMarkdown(text: string) {
  const parts = []
  const regex = /(\*\*.*?\*\*|`.*?`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-primary border border-border"
        >
          {token.slice(1, -1)}
        </code>
      )
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const user = useUserProfile()

  return (
    <div
      className={`py-5 px-4 sm:px-8 flex gap-4 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-muted/30 border-y border-border/40'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="size-8 rounded-full object-cover shadow-sm ring-1 ring-border"
            />
          ) : (
            <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user.initials}
            </div>
          )
        ) : (
          <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="size-4" />
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0 space-y-3 text-xs leading-relaxed text-foreground">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-xs">
              {isUser ? user.name : 'AI Engineering Copilot'}
            </span>
            {!isUser && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                Verified Analysis
              </span>
            )}
          </div>
          {message.timestamp && (
            <span className="text-[10px] text-muted-foreground font-mono">{message.timestamp}</span>
          )}
        </div>

        {/* Text Paragraphs */}
        <div className="space-y-2.5 text-foreground text-[13px] leading-relaxed">
          {message.content.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-sm font-semibold text-foreground pt-1.5">
                  {formatInlineMarkdown(paragraph.replace('### ', ''))}
                </h3>
              )
            }
            if (paragraph.startsWith('- ') || paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
              const listItems = paragraph.split('\n')
              return (
                <ul key={pIdx} className="list-disc pl-4 space-y-1 text-foreground">
                  {listItems.map((item, iIdx) => (
                    <li key={iIdx}>
                      {formatInlineMarkdown(item.replace(/^[-*]|\d+\.\s*/, ''))}
                    </li>
                  ))}
                </ul>
              )
            }
            return <p key={pIdx}>{formatInlineMarkdown(paragraph)}</p>
          })}
        </div>

        {/* File Reference Pills */}
        {message.references && message.references.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground font-mono">Referenced Files:</span>
            {message.references.map((ref) => (
              <span
                key={ref}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-mono text-primary cursor-pointer hover:border-primary/40 transition-all shadow-2xs"
              >
                <FileCode className="size-3" />
                {ref}
              </span>
            ))}
          </div>
        )}

        {/* Structured Table (if present) */}
        {message.tableData && (
          <div className="my-3 rounded-xl border border-border overflow-x-auto bg-card font-mono text-[11px] shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/80 border-b border-border text-muted-foreground">
                <tr>
                  {message.tableData.headers.map((h, i) => (
                    <th key={i} className="py-2 px-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {message.tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Code Snippets */}
        {message.codeSnippets && message.codeSnippets.length > 0 && (
          <div className="space-y-3 pt-1">
            {message.codeSnippets.map((snippet, sIdx) => (
              <CodeBlock
                key={sIdx}
                language={snippet.language}
                filename={snippet.filename}
                code={snippet.code}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

