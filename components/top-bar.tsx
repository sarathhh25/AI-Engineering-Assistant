"use client"

import { ChevronDown, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopBar({ onNewChat }: { onNewChat: () => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">Copilot</span>
          <button className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            acme / monorepo
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onNewChat}
        className="gap-1.5"
      >
        <Plus className="size-4" />
        New chat
      </Button>
    </header>
  )
}
