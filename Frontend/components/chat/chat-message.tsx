'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
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
  isError?: boolean
}

interface ChatMessageProps {
  message: ChatMessageData
  onClearMessage?: (id: string) => void
  onRetryMessage?: (id: string) => void
  onSelectReference?: (reference: string) => void
}

/**
 * Formats inline markdown syntax:
 * - **bold**
 * - *italic*
 * - [links](url)
 * - `code` (with subtle inline file-link citations)
 */
function formatInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = []
  // Matches: **bold**, `inline code`, [link text](url), *italic*
  const regex = /(\*\*[\s\S]*?\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    const token = match[0]

    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/)
      if (linkMatch) {
        const [, linkText, linkHref] = linkMatch
        parts.push(
          <a
            key={match.index}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium inline-flex items-center gap-0.5 break-all"
          >
            {linkText}
          </a>
        )
      } else {
        parts.push(token)
      }
    } else if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      const codeVal = token.slice(1, -1)
      const cleanRef = codeVal.startsWith('@') ? codeVal.slice(1) : codeVal
      const isFileRef =
        codeVal.startsWith('@') ||
        /^[\w./\-]+\.(ts|tsx|js|jsx|py|json|md|yml|yaml|css|html|sql|go|rs|toml)(:L?\d+(-\d+)?)?$/i.test(codeVal)

      if (isFileRef) {
        parts.push(
          <button
            key={match.index}
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(cleanRef)
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('copilot:select-file', { detail: { file: cleanRef } }))
              }
            }}
            title={`File reference: ${cleanRef} (click to copy)`}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-mono text-[12px] border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer align-baseline select-text"
          >
            <FileCode className="size-3 inline-block shrink-0 opacity-80" />
            <span>{cleanRef}</span>
          </button>
        )
      } else {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded-md bg-muted/70 font-mono text-[13px] text-foreground font-medium border border-border/40 break-all"
          >
            {codeVal}
          </code>
        )
      }
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      parts.push(
        <em key={match.index} className="italic text-foreground/90">
          {token.slice(1, -1)}
        </em>
      )
    } else {
      parts.push(token)
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

/**
 * Renders full structured Markdown content with headings, lists, tables, blockquotes,
 * code blocks, and comfortable reading typography.
 */
function renderFormattedContent(content: string) {
  // 1. Separate fenced code blocks (```language\ncode\n```)
  const segments: { type: 'code' | 'text'; content: string; language?: string }[] = []
  const codeFenceRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = codeFenceRegex.exec(content)) !== null) {
    if (match.index > lastIdx) {
      const textChunk = content.substring(lastIdx, match.index)
      if (textChunk.trim()) {
        segments.push({ type: 'text', content: textChunk })
      }
    }
    segments.push({
      type: 'code',
      language: match[1]?.trim() || 'typescript',
      content: match[2]?.trimEnd() || '',
    })
    lastIdx = codeFenceRegex.lastIndex
  }

  if (lastIdx < content.length) {
    const trailing = content.substring(lastIdx)
    if (trailing.trim()) {
      segments.push({ type: 'text', content: trailing })
    }
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', content })
  }

  return segments.map((seg, sIdx) => {
    if (seg.type === 'code') {
      return (
        <CodeBlock
          key={sIdx}
          language={seg.language || 'typescript'}
          code={seg.content}
        />
      )
    }

    const paragraphs = seg.content.split(/\n{2,}/)

    return (
      <div key={sIdx} className="space-y-3.5">
        {paragraphs.map((para, pIdx) => {
          const trimmed = para.trim()
          if (!trimmed) return null

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
            return <hr key={pIdx} className="my-4 border-border/40" />
          }

          // Headings with clear hierarchy and consistent spacing
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={pIdx} className="text-lg sm:text-xl font-bold text-foreground tracking-tight pt-3 pb-1 border-b border-border/30 break-words">
                {formatInlineMarkdown(trimmed.replace(/^#\s+/, ''))}
              </h1>
            )
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={pIdx} className="text-base sm:text-lg font-semibold text-foreground tracking-tight pt-2.5 pb-0.5 break-words">
                {formatInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
              </h2>
            )
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={pIdx} className="text-[15px] font-semibold text-foreground pt-2 break-words">
                {formatInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
              </h3>
            )
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h4 key={pIdx} className="text-sm font-semibold text-foreground/90 pt-1.5 break-words">
                {formatInlineMarkdown(trimmed.replace(/^####\s+/, ''))}
              </h4>
            )
          }

          // Blockquotes
          if (trimmed.startsWith('>')) {
            const quoteText = trimmed.replace(/^>\s?/, '').replace(/\n>\s?/g, '\n')
            return (
              <blockquote
                key={pIdx}
                className="border-l-2 border-primary/60 pl-3.5 my-2.5 italic text-muted-foreground text-[14px] leading-relaxed"
              >
                {formatInlineMarkdown(quoteText)}
              </blockquote>
            )
          }

          // Markdown Table detection
          const lines = trimmed.split('\n')
          const isMarkdownTable =
            lines.length >= 2 &&
            lines.every((l) => l.trim().startsWith('|') && l.trim().endsWith('|')) &&
            lines.some((l) => /\|?\s*[-:]+[-| :]*\s*\|?/.test(l))

          if (isMarkdownTable) {
            const parseCells = (line: string) =>
              line
                .trim()
                .slice(1, -1)
                .split('|')
                .map((c) => c.trim())

            const headers = parseCells(lines[0])
            // Filter out divider line (e.g. |---|---|)
            const dataLines = lines.slice(1).filter((l) => !/\|?\s*[-:]+[-| :]*\s*\|?/.test(l))
            const rows = dataLines.map(parseCells)

            return (
              <div key={pIdx} className="my-3 rounded-xl border border-border/60 overflow-x-auto bg-card/40 font-mono text-xs shadow-xs max-w-full">
                <table className="w-full text-left border-collapse min-w-[340px]">
                  <thead className="bg-muted/70 border-b border-border text-muted-foreground">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3.5 font-semibold text-foreground/90">
                          {formatInlineMarkdown(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3.5 whitespace-normal break-words">
                            {formatInlineMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }

          // Ordered and Unordered Lists
          const listLines = trimmed.split('\n')
          const isAllListItems = listLines.every(
            (l) => !l.trim() || /^(\d+\.\s+|[-*•]\s+)/.test(l.trim())
          )

          if (isAllListItems && listLines.some((l) => /^(\d+\.\s+|[-*•]\s+)/.test(l.trim()))) {
            const firstItem = listLines.find((l) => l.trim()) || ''
            const isOrdered = /^\d+\.\s+/.test(firstItem.trim())

            if (isOrdered) {
              return (
                <ol key={pIdx} className="list-decimal pl-6 space-y-1.5 my-2 text-foreground/90 text-[14px] sm:text-[15px] leading-7">
                  {listLines.filter((l) => l.trim()).map((item, iIdx) => {
                    const cleanItem = item.trim().replace(/^\d+\.\s+/, '')
                    return (
                      <li key={iIdx} className="break-words [overflow-wrap:anywhere] pl-1">
                        {formatInlineMarkdown(cleanItem)}
                      </li>
                    )
                  })}
                </ol>
              )
            } else {
              return (
                <ul key={pIdx} className="list-disc pl-6 space-y-1.5 my-2 text-foreground/90 text-[14px] sm:text-[15px] leading-7 marker:text-primary/70">
                  {listLines.filter((l) => l.trim()).map((item, iIdx) => {
                    const cleanItem = item.trim().replace(/^[-*•]\s+/, '')
                    return (
                      <li key={iIdx} className="break-words [overflow-wrap:anywhere] pl-1">
                        {formatInlineMarkdown(cleanItem)}
                      </li>
                    )
                  })}
                </ul>
              )
            }
          }

          // Standard paragraph with comfortable line height and clean readable body size
          return (
            <p key={pIdx} className="text-[14px] sm:text-[15px] leading-7 text-foreground/90 break-words [overflow-wrap:anywhere]">
              {formatInlineMarkdown(trimmed)}
            </p>
          )
        })}
      </div>
    )
  })
}

function renderUserContent(content: string) {
  if (content.includes('```')) {
    return renderFormattedContent(content)
  }
  return (
    <div className="whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere] text-[13.5px] sm:text-[14px]">
      {formatInlineMarkdown(content)}
    </div>
  )
}

export function ChatMessage({ message, onClearMessage, onRetryMessage, onSelectReference }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const user = useUserProfile()
  const isError = !isUser && (message.isError || message.content.includes('Backend Error:') || message.content.includes('charmap'))

  // State for message actions
  const [copiedAnswer, setCopiedAnswer] = useState(false)
  const [copiedRef, setCopiedRef] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`copilot_feedback_${message.id}`)
        if (stored === 'helpful' || stored === 'unhelpful') return stored
      } catch {}
    }
    return null
  })

  // Grounding check: Only display "Verified Analysis" if backed by actual repository evidence references
  const hasGroundedEvidence = Boolean(!isError && message.references && message.references.length > 0)

  const handleCopyAnswer = () => {
    navigator.clipboard?.writeText(message.content)
    setCopiedAnswer(true)
    setTimeout(() => setCopiedAnswer(false), 2000)
  }

  const handleCopyReference = (refText: string) => {
    const cleanRef = refText.startsWith('@') ? refText.slice(1) : refText
    navigator.clipboard?.writeText(cleanRef)
    setCopiedRef(cleanRef)
    setTimeout(() => setCopiedRef(null), 2000)

    if (onSelectReference) {
      onSelectReference(cleanRef)
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('copilot:select-file', { detail: { file: cleanRef } }))
    }
  }

  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedback((prev) => {
      const next = prev === type ? null : type
      if (typeof window !== 'undefined') {
        try {
          if (next) {
            localStorage.setItem(`copilot_feedback_${message.id}`, next)
          } else {
            localStorage.removeItem(`copilot_feedback_${message.id}`)
          }
        } catch {}
      }
      return next
    })
  }

  // 1. User Message: Aligned to the RIGHT
  if (isUser) {
    return (
      <div className="w-full flex justify-end">
        <div className="flex items-start gap-2.5 sm:gap-3 max-w-[88%] sm:max-w-[75%] justify-end min-w-0">
          {/* User message body & subtle metadata header */}
          <div className="flex flex-col items-end min-w-0">
            {/* User name & timestamp */}
            <div className="flex items-center gap-2 mb-1 px-1 select-none text-[11px] text-muted-foreground">
              {message.timestamp && (
                <span className="font-mono text-[10px] text-muted-foreground/60">{message.timestamp}</span>
              )}
              <span className="font-medium text-muted-foreground/80">
                {user.name || 'You'}
              </span>
            </div>

            {/* User bubble with subtle blue-tinted accent matching theme */}
            <div className="rounded-2xl rounded-tr-xs bg-primary/10 dark:bg-primary/15 border border-primary/20 dark:border-primary/25 text-foreground px-4 py-2.5 sm:py-3 text-[13.5px] leading-relaxed shadow-xs break-words [overflow-wrap:anywhere] min-w-0">
              {renderUserContent(message.content)}
            </div>
          </div>

          {/* User Avatar */}
          <div className="shrink-0 mt-0.5">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="size-7 sm:size-8 rounded-full object-cover shadow-xs ring-1 ring-primary/30"
              />
            ) : (
              <div className="size-7 sm:size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs ring-1 ring-primary/20">
                {user.initials || 'U'}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 2. AI Assistant Message: Aligned to the LEFT with clean, cardless natural canvas layout
  return (
    <div className="w-full flex justify-start">
      <div className="flex items-start gap-3 sm:gap-3.5 w-full max-w-full sm:max-w-[860px] min-w-0">
        {/* Assistant Avatar */}
        <div className="shrink-0 mt-0.5">
          {isError ? (
            <div className="size-7 sm:size-8 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shadow-xs">
              <AlertTriangle className="size-4" />
            </div>
          ) : (
            <div className="size-7 sm:size-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="size-4" />
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row: Identity, Grounded Analysis Indicator, Timestamp */}
          <div className="flex items-center gap-2 select-none px-0.5">
            <span className="font-semibold text-foreground text-xs sm:text-[13px]">
              AI Engineering Copilot
            </span>

            {/* Truthful Grounded Analysis Indicator - only shown when actual file evidence exists */}
            {hasGroundedEvidence && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="size-2.5 text-primary" />
                Verified Analysis
              </span>
            )}

            {isError && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 font-semibold">
                Error Notice
              </span>
            )}

            {message.timestamp && (
              <span className="text-[10px] text-muted-foreground/60 font-mono ml-auto sm:ml-2">
                {message.timestamp}
              </span>
            )}
          </div>

          {/* Assistant Response Content Area */}
          {isError ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive-foreground space-y-3 shadow-xs">
              <div className="text-xs text-red-300 font-medium leading-relaxed break-words">
                {message.content.replace(/^[⚠️\s]*/, '')}
              </div>
              <div className="flex items-center gap-2 pt-1">
                {onRetryMessage && (
                  <button
                    type="button"
                    onClick={() => onRetryMessage(message.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="size-3" />
                    Retry Question
                  </button>
                )}
                {onClearMessage && (
                  <button
                    type="button"
                    onClick={() => onClearMessage(message.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-medium border border-border transition-all cursor-pointer"
                  >
                    <X className="size-3" />
                    Clear That Error
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 min-w-0 pt-0.5">
              {/* Natural Canvas Markdown Content (Heavy enclosing card background removed) */}
              <div className="space-y-3.5 text-foreground leading-7 break-words [overflow-wrap:anywhere]">
                {renderFormattedContent(message.content)}
              </div>

              {/* Structured Table (if present in message payload) */}
              {message.tableData && (
                <div className="my-3 rounded-xl border border-border overflow-x-auto bg-card/50 font-mono text-xs shadow-xs max-w-full">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/80 border-b border-border text-muted-foreground">
                      <tr>
                        {message.tableData.headers.map((h, i) => (
                          <th key={i} className="py-2.5 px-3.5 font-semibold text-foreground/90">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-foreground">
                      {message.tableData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3.5">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Explicit Code Snippets (if present in payload) */}
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

              {/* Sources / Referenced Files (Grouped into clean section at bottom of response) */}
              {message.references && message.references.length > 0 && (
                <div className="pt-3.5 mt-3 border-t border-border/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground select-none">
                    <FileCode className="size-3.5 text-primary" />
                    <span>Referenced files ({message.references.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {message.references.map((ref) => {
                      const cleanRef = ref.startsWith('@') ? ref.slice(1) : ref
                      const isCopied = copiedRef === cleanRef
                      return (
                        <button
                          key={ref}
                          type="button"
                          onClick={() => handleCopyReference(cleanRef)}
                          title={`Click to copy reference: ${cleanRef}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/70 hover:bg-secondary border border-border/60 hover:border-primary/40 text-foreground text-xs font-mono transition-all cursor-pointer group shadow-2xs"
                        >
                          <FileCode className="size-3 text-primary/70 group-hover:text-primary transition-colors shrink-0" />
                          <span className="truncate max-w-[260px] sm:max-w-[400px]">{cleanRef}</span>
                          {isCopied && (
                            <span className="text-[10px] text-emerald-500 font-sans font-medium ml-1">Copied!</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Assistant Message Actions: Copy Answer, Helpful/Not Helpful, Retry */}
              <div className="flex items-center gap-1.5 pt-2.5 select-none text-muted-foreground">
                {/* 1. Copy Answer Action */}
                <button
                  type="button"
                  onClick={handleCopyAnswer}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs hover:text-foreground hover:bg-secondary/70 transition-colors cursor-pointer border border-transparent hover:border-border/50"
                  title="Copy full answer to clipboard"
                >
                  {copiedAnswer ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span className="text-[11px] text-emerald-500 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span className="text-[11px]">Copy answer</span>
                    </>
                  )}
                </button>

                <div className="h-3 w-px bg-border/60 mx-1" />

                {/* 2. Helpful Feedback Toggle */}
                <button
                  type="button"
                  onClick={() => handleFeedback('helpful')}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer border border-transparent ${
                    feedback === 'helpful'
                      ? 'bg-primary/15 text-primary border-primary/30 font-medium'
                      : 'hover:text-foreground hover:bg-secondary/70'
                  }`}
                  title="Mark this answer as helpful"
                >
                  <ThumbsUp className={`size-3.5 ${feedback === 'helpful' ? 'fill-primary' : ''}`} />
                  <span className="text-[11px]">Helpful</span>
                </button>

                {/* 3. Not Helpful Feedback Toggle */}
                <button
                  type="button"
                  onClick={() => handleFeedback('unhelpful')}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer border border-transparent ${
                    feedback === 'unhelpful'
                      ? 'bg-destructive/15 text-destructive border-destructive/30 font-medium'
                      : 'hover:text-foreground hover:bg-secondary/70'
                  }`}
                  title="Mark this answer as not helpful"
                >
                  <ThumbsDown className={`size-3.5 ${feedback === 'unhelpful' ? 'fill-destructive' : ''}`} />
                  <span className="text-[11px]">Not helpful</span>
                </button>

                {/* 4. Retry Response Action */}
                {onRetryMessage && (
                  <>
                    <div className="h-3 w-px bg-border/60 mx-1" />
                    <button
                      type="button"
                      onClick={() => onRetryMessage(message.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs hover:text-foreground hover:bg-secondary/70 transition-colors cursor-pointer border border-transparent hover:border-border/50"
                      title="Retry this response"
                    >
                      <RefreshCw className="size-3.5" />
                      <span className="text-[11px]">Retry response</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
