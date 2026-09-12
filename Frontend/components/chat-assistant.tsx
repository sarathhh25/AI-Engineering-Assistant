'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, PanelRightOpen } from 'lucide-react'
import { ChatInput } from '@/components/chat-input'
import { IntegrationsDrawer } from '@/components/integrations-drawer'
import { MessageList, type ChatMessage } from '@/components/message-list'
import { SuggestionPills } from '@/components/suggestion-pills'
import { TopBar as Header } from '@/components/top-bar'
import { useUserProfile } from '@/lib/use-user-profile'

export function ChatAssistant() {
  const userProfile = useUserProfile()

  // 1. Initialize state from localStorage (or default to true)
  const [drawerOpen, setDrawerOpen] = useState(true)
  
  useEffect(() => {
    const savedState = localStorage.getItem('integrationsPanelOpen')
    if (savedState !== null) {
      setDrawerOpen(JSON.parse(savedState))
    }
  }, [])

  // 2. Persist state on change
  const toggleDrawer = () => {
    const newState = !drawerOpen
    setDrawerOpen(newState)
    localStorage.setItem('integrationsPanelOpen', JSON.stringify(newState))
  }

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentRepo, setCurrentRepo] = useState('sarathhh25/Google_maps')
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasConversation = messages.length > 0

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(text: string, attachments: File[] = []) {
    if (!text.trim() && attachments.length === 0) return

    // Read attached files using FileReader API (readAsText)
    const filesData: Array<{ fileName: string; content: string }> = await Promise.all(
      attachments.map((file) => {
        return new Promise<{ fileName: string; content: string }>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            resolve({
              fileName: file.name,
              content: (e.target?.result as string) || '',
            })
          }
          reader.onerror = () => {
            resolve({ fileName: file.name, content: '' })
          }
          reader.readAsText(file)
        })
      })
    )

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, repo: currentRepo, files: filesData }),
      })
      const data = await response.json()
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.reply, sources: [currentRepo] }])
    } catch (error) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: '⚠️ Could not reach backend.', sources: ['Error'] }])
    }
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div className="flex min-w-0 flex-1 flex-col">
        
        {/* Pass toggle function to Header so we can reopen it */}
        <Header onNewChat={() => setMessages([])} onToggleDrawer={toggleDrawer} isDrawerOpen={drawerOpen} />

        <div className="bg-muted/40 border-b px-4 py-1.5 text-xs flex justify-between items-center text-muted-foreground">
          <span>Active Repository: <strong className="text-foreground">{currentRepo}</strong></span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {hasConversation ? (
            <div className="mx-auto py-6 px-4">
              <MessageList messages={messages} />
            </div>
          ) : (
            <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/10">
                <Sparkles className="size-7" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Ask anything about {currentRepo}</h1>
            </div>
          )}
        </div>

        <div className="shrink-0 px-4 pb-6 mx-auto w-full">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            <SuggestionPills onSelect={(v: string) => send(v, [])} />
            <ChatInput onSubmit={(text, isRepoAware) => send(text, [])} />
          </div>
        </div>
      </div>

      {/* Smooth Width Transition for the Panel */}
      <div 
        className={`border-l bg-background shrink-0 transition-[width,opacity] duration-300 ease-in-out overflow-hidden ${
          drawerOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'
        }`}
      >
        <div className="w-80 h-full relative">
          {/* Close X Button inside the drawer */}
          <button 
            onClick={toggleDrawer}
            className="absolute top-4 right-4 z-10 p-1 rounded hover:bg-muted text-muted-foreground"
          >
            ✕
          </button>
          <IntegrationsDrawer open={drawerOpen} onToggle={toggleDrawer} />
        </div>
      </div>
    </div>
  )
}