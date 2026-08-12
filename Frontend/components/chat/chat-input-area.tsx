'use client'

import React, { useState, useRef } from 'react'
import {
  Send,
  Paperclip,
  AtSign,
  Mic,
  Database,
  ArrowUp
} from 'lucide-react'

import { MentionMenu, MentionItem } from './mention-menu'
import { AttachmentManager, AttachedFile } from './attachment-manager'
import { SuggestionPills } from '@/components/suggestion-pills'

interface ChatInputAreaProps {
  onSubmit: (text: string, attachments?: AttachedFile[]) => void
  disabled?: boolean
  onSelectSuggestion?: (text: string) => void
}

export function ChatInputArea({ onSubmit, disabled, onSelectSuggestion }: ChatInputAreaProps) {
  const [text, setText] = useState('')
  const [repoContextEnabled, setRepoContextEnabled] = useState(true)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [attachments, setAttachments] = useState<AttachedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!text.trim() && attachments.length === 0) return

    onSubmit(text, attachments)
    setText('')
    setAttachments([])
    setShowMentionMenu(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey
    if ((e.key === 'Enter' && !e.shiftKey) || (isCmdOrCtrl && e.key === 'Enter')) {
      if (!showMentionMenu) {
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)

    const atPos = val.lastIndexOf('@')
    if (atPos !== -1 && atPos >= val.length - 15) {
      const query = val.slice(atPos + 1)
      setMentionQuery(query)
      setShowMentionMenu(true)
    } else {
      setShowMentionMenu(false)
    }
  }

  const handleSelectMention = (item: MentionItem) => {
    const atPos = text.lastIndexOf('@')
    const newText = atPos !== -1 ? text.slice(0, atPos) + item.name + ' ' : text + ' ' + item.name + ' '
    setText(newText)
    setShowMentionMenu(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileList = Array.from(files)
    fileList.forEach((file, i) => {
      const reader = new FileReader()
      const ext = file.name.split('.').pop() || 'txt'
      const sizeKb = (file.size / 1024).toFixed(1) + ' KB'

      reader.onload = (event) => {
        const fileContent = (event.target?.result as string) || ''
        const newAttachedFile: AttachedFile = {
          id: `att-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          fileName: file.name,
          content: fileContent,
          type: ext,
          size: sizeKb,
          progress: 100,
        }
        setAttachments((prev) => [...prev, newAttachedFile])
      }

      reader.onerror = () => {
        console.error(`Failed to read file: ${file.name}`)
      }

      reader.readAsText(file)
    })

    if (e.target) {
      e.target.value = ''
    }
  }

  const handleSuggestionClick = (pillText: string) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(pillText)
    } else {
      onSubmit(pillText)
    }
  }

  return (
    <div className="sticky bottom-0 z-20 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-4 pb-4 px-4 sm:px-6 shrink-0 select-none">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Suggestion Pills right above the sticky input */}
        <SuggestionPills onSelect={handleSuggestionClick} />

        {/* Searchable Mention Menu */}
        {showMentionMenu && (
          <MentionMenu
            query={mentionQuery}
            onSelect={handleSelectMention}
            onClose={() => setShowMentionMenu(false)}
          />
        )}

        {/* Attachment Manager Bar */}
        <AttachmentManager
          attachments={attachments}
          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative rounded-2xl border border-border/80 bg-card/90 dark:bg-zinc-900/90 shadow-xl p-3 space-y-2.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all backdrop-blur-sm">
            {/* Textarea Input */}
            <textarea
              rows={2}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your engineering flow..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none px-2 py-1 leading-relaxed"
            />

            {/* Action Toolbar Row */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <div className="flex items-center gap-1.5">
                {/* @ Mention Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setText((prev) => prev + '@')
                    setShowMentionMenu(true)
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1 text-[11px]"
                  title="@ Mention (Issues, PRs, Files)"
                >
                  <AtSign className="size-3.5 text-primary" />
                  <span className="hidden sm:inline">Mention</span>
                </button>

                {/* Upload Attachment Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  accept=".pdf,.docx,.txt,.md,.csv,.json,.png,.jpg,.zip"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1 text-[11px]"
                  title="Attach Files"
                >
                  <Paperclip className="size-3.5" />
                  <span className="hidden sm:inline">Attach</span>
                </button>

                {/* Repo Context Status Badge */}
                <button
                  type="button"
                  onClick={() => setRepoContextEnabled((prev) => !prev)}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-mono transition-all flex items-center gap-1 ${
                    repoContextEnabled
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                  title="Toggle Repository Vector Context"
                >
                  <Database className="size-3" />
                  <span className="hidden sm:inline">
                    {repoContextEnabled ? 'Repo Context ON' : 'Repo Context OFF'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">Enter ↵</kbd>
                </span>

                <button
                  type="submit"
                  disabled={(!text.trim() && attachments.length === 0) || disabled}
                  className="size-8 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold shadow-md shadow-primary/20 transition-all flex items-center justify-center active:scale-95"
                  title="Send message"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

