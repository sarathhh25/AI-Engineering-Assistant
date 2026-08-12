"use client"

import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

function AssistantAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
      <Sparkles className="size-4" />
    </div>
  )
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {messages.map((m) =>
        m.role === "assistant" ? (
          <div key={m.id} className="flex gap-3">
            <AssistantAvatar />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Copilot
              </p>
              <div className="rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-[15px] leading-relaxed text-foreground shadow-sm">
                <p className="whitespace-pre-wrap text-pretty">{m.content}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                    {m.sources.map((src) => (
                      <span
                        key={src}
                        className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div key={m.id} className="flex justify-end">
            <div
              className={cn(
                "max-w-[80%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground shadow-sm",
              )}
            >
              <p className="whitespace-pre-wrap text-pretty">{m.content}</p>
            </div>
          </div>
        ),
      )}
    </div>
  )
}
