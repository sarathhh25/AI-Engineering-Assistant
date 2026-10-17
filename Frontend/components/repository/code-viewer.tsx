'use client'

import React, { useState, useMemo } from 'react'
import {
  FileCode,
  Copy,
  Check,
  Plus,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  Binary,
  GitBranch,
  ShieldAlert,
  FileQuestion,
} from 'lucide-react'

interface CodeViewerProps {
  filename: string
  repo?: string
  branch?: string
  codeContent?: string | null
  isLoading?: boolean
  error?: string | null
  isBinary?: boolean
  isTruncated?: boolean
  language?: string
  fileSize?: number
  onActionTrigger?: (action: string) => void
  onSelectContext?: (filename: string) => void
  onSendToCopilot?: (filename: string) => void
  onRetry?: () => void
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Tokenize a single line with syntax highlighting colors
function highlightLine(line: string, lang: string): React.ReactNode {
  if (!line) return <span>&nbsp;</span>

  const l = (lang || '').toLowerCase()

  // Full-line comments
  if (
    (l === 'python' || l === 'shell' || l === 'yaml') &&
    line.trim().startsWith('#')
  ) {
    return <span className="text-muted-foreground/60 italic">{line}</span>
  }
  if (
    (l === 'typescript' || l === 'javascript' || l === 'java' || l === 'c' || l === 'cpp' || l === 'csharp' || l === 'rust' || l === 'go') &&
    line.trim().startsWith('//')
  ) {
    return <span className="text-muted-foreground/60 italic">{line}</span>
  }
  if (l === 'sql' && line.trim().startsWith('--')) {
    return <span className="text-muted-foreground/60 italic">{line}</span>
  }

  // Regex tokenizer matching comments, strings, keywords, numbers, punctuation
  const tokenRegex =
    /(\/\*[\s\S]*?\*\/|\/\/.*|#.*|--.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:def|class|function|const|let|var|return|import|export|from|as|default|if|else|elif|for|while|try|catch|except|finally|with|async|await|interface|type|extends|implements|new|public|private|protected|static|final|SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|INSERT|INTO|VALUES|UPDATE|SET|DELETE|GROUP|BY|ORDER|HAVING|LIMIT|AND|OR|NOT|NULL|TRUE|FALSE|True|False|None)\b)|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())|([a-zA-Z_$][a-zA-Z0-9_$]*)|([^\s\w]+)|\s+/g

  const nodes: React.ReactNode[] = []
  let match: RegExpExecArray | null
  let lastIdx = 0

  while ((match = tokenRegex.exec(line)) !== null) {
    const text = match[0]
    const [
      ,
      comment,
      str,
      kw,
      num,
      fn,
      ident,
    ] = match

    const key = `t-${lastIdx++}`

    if (comment) {
      nodes.push(<span key={key} className="text-muted-foreground/60 italic">{text}</span>)
    } else if (str) {
      nodes.push(<span key={key} className="text-emerald-400 dark:text-emerald-300">{text}</span>)
    } else if (kw) {
      nodes.push(<span key={key} className="text-purple-400 font-semibold">{text}</span>)
    } else if (num) {
      nodes.push(<span key={key} className="text-amber-400 dark:text-amber-300 font-mono">{text}</span>)
    } else if (fn) {
      nodes.push(<span key={key} className="text-blue-400 dark:text-blue-300">{text}</span>)
    } else if (ident) {
      if (ident[0] === ident[0].toUpperCase() && ident.length > 1) {
        // Likely a Class or Type name
        nodes.push(<span key={key} className="text-sky-400 dark:text-sky-300 font-medium">{text}</span>)
      } else {
        nodes.push(<span key={key} className="text-foreground">{text}</span>)
      }
    } else {
      nodes.push(<span key={key} className="text-foreground/90">{text}</span>)
    }
  }

  return nodes.length > 0 ? nodes : <span>{line}</span>
}

export function CodeViewer({
  filename,
  repo,
  branch,
  codeContent,
  isLoading = false,
  error = null,
  isBinary = false,
  isTruncated = false,
  language = 'plaintext',
  fileSize,
  onActionTrigger,
  onSelectContext,
  onSendToCopilot,
  onRetry,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!codeContent) return
    navigator.clipboard.writeText(codeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = useMemo(() => {
    if (!codeContent) return []
    return codeContent.split('\n')
  }, [codeContent])

  return (
    <div className="flex-1 flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-xs select-none font-mono">
      {/* Top Header Bar */}
      <div className="px-3.5 py-2.5 bg-muted/60 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="size-4 text-primary shrink-0" />
          <span className="text-foreground font-semibold truncate max-w-[280px] sm:max-w-[420px]" title={filename}>
            {filename || 'Select a file'}
          </span>

          {branch && (
            <span className="flex items-center gap-1 text-[10px] bg-secondary/80 px-2 py-0.5 rounded-md text-emerald-500 font-mono border border-border">
              <GitBranch className="size-3" />
              <span>{branch}</span>
            </span>
          )}

          {language && (
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-md text-muted-foreground uppercase font-mono border border-border">
              {language}
            </span>
          )}

          {fileSize !== undefined && (
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
              {formatBytes(fileSize)}
            </span>
          )}

          {isTruncated && (
            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-mono font-semibold">
              Truncated (Preview)
            </span>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onSelectContext && onSelectContext(filename)}
            disabled={!codeContent || isBinary || isLoading}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Attach this file as context to the AI Assistant"
          >
            <Plus className="size-3 text-purple-500" />
            <span>Select as Context</span>
          </button>

          <button
            onClick={() => onSendToCopilot && onSendToCopilot(filename)}
            disabled={!codeContent || isBinary || isLoading}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send file path to AI Copilot chat"
          >
            <Send className="size-3" />
            <span>Send to Copilot</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!codeContent || isBinary || isLoading}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Copy file contents"
          >
            {copied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3 text-muted-foreground" />
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-muted/20 relative">
        {/* Loading State */}
        {isLoading && (
          <div className="p-8 flex flex-col items-center justify-center space-y-3 h-full text-muted-foreground font-mono text-xs">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span>Fetching source code from GitHub ({branch || 'branch'})...</span>
          </div>
        )}

        {/* Error State - Never show placeholder code */}
        {!isLoading && error && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 h-full max-w-md mx-auto">
            <div className="size-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-sm">Failed to Load Source File</h3>
              <p className="text-muted-foreground text-xs font-mono leading-relaxed">{error}</p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors text-xs font-medium cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Retry Fetch</span>
              </button>
            )}
          </div>
        )}

        {/* Binary File Display */}
        {!isLoading && !error && isBinary && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 h-full max-w-md mx-auto">
            <div className="size-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground">
              <Binary className="size-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-sm">Binary File</h3>
              <p className="text-muted-foreground text-xs font-mono">
                {filename} ({formatBytes(fileSize)})
              </p>
              <p className="text-muted-foreground/80 text-[11px] pt-1">
                Binary or media files cannot be displayed directly in the source-code viewer.
              </p>
            </div>
          </div>
        )}

        {/* Empty selection state */}
        {!isLoading && !error && !isBinary && !filename && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 h-full text-muted-foreground font-mono text-xs">
            <FileQuestion className="size-8 text-muted-foreground/40" />
            <span>Select a file from the repository tree to browse its source code.</span>
          </div>
        )}

        {/* Real Source Code Display */}
        {!isLoading && !error && !isBinary && filename && (
          <div className="p-4 text-xs font-mono leading-relaxed select-text min-w-full">
            {lines.length === 0 ? (
              <div className="text-muted-foreground italic p-4 text-center">
                (Empty file)
              </div>
            ) : (
              <table className="w-full text-left border-collapse font-mono">
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="pr-4 select-none text-right text-muted-foreground/50 text-[11px] w-10 shrink-0 font-mono align-top py-0.5">
                        {idx + 1}
                      </td>
                      <td className="whitespace-pre font-mono text-xs py-0.5 break-all sm:break-normal">
                        {highlightLine(line, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
