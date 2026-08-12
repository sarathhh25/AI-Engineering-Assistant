'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Paperclip, AtSign, ArrowUp, GitPullRequest } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (text: string, isRepoAware: boolean) => void
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [text, setText] = useState('')
  const [isRepoAware, setIsRepoAware] = useState(true) // Toggle State
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text, isRepoAware)
      setText('')
    }
  }

  return (
    <div className="relative flex flex-col w-full bg-background border rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 transition-all p-2">
      
      {/* Main Text Input */}
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your codebase, pull requests, architecture, or team..."
        className="w-full bg-transparent border-none focus:outline-none px-4 pt-2 pb-4 text-foreground placeholder:text-muted-foreground"
      />

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
            <Paperclip className="size-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
            <AtSign className="size-5" />
          </button>
          
          {/* Repo Aware Toggle Switch */}
          <div className="flex items-center gap-2 ml-2 bg-muted/40 border px-3 py-1.5 rounded-full cursor-pointer hover:bg-muted/60 transition-colors" onClick={() => setIsRepoAware(!isRepoAware)}>
            <GitPullRequest className={`size-4 ${isRepoAware ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-medium ${isRepoAware ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
              Repo aware
            </span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isRepoAware ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
              <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${isRepoAware ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-full disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground hover:opacity-90 transition-all"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
    </div>
  )
}