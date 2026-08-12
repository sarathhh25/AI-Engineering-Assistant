"use client"

import Image from "next/image"
import { PanelRightClose, PanelRightOpen, Plus, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { integrations, type IntegrationStatus } from "@/lib/integrations"

const statusStyles: Record<
  IntegrationStatus,
  { dot: string; label: string; text: string }
> = {
  connected: {
    dot: "bg-[oklch(0.72_0.15_150)]",
    label: "Connected",
    text: "text-[oklch(0.5_0.13_150)]",
  },
  syncing: {
    dot: "bg-primary animate-pulse",
    label: "Syncing",
    text: "text-primary",
  },
  error: {
    dot: "bg-destructive",
    label: "Attention",
    text: "text-destructive",
  },
}

export function IntegrationsDrawer({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col border-l border-border bg-sidebar transition-[width] duration-300 ease-out",
        open ? "w-80" : "w-14",
      )}
      aria-label="Integrations"
    >
      {/* Header */}
      <div className="flex h-16 items-center gap-2 px-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={open ? "Collapse integrations panel" : "Expand integrations panel"}
          className="text-muted-foreground"
        >
          {open ? (
            <PanelRightClose className="size-5" />
          ) : (
            <PanelRightOpen className="size-5" />
          )}
        </Button>
        {open && (
          <div className="flex min-w-0 flex-1 items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                Integrations
              </p>
              <p className="truncate text-xs text-muted-foreground">
                4 sources connected
              </p>
            </div>
            <span className="flex size-2 items-center justify-center">
              <span className="size-2 rounded-full bg-[oklch(0.72_0.15_150)]" />
            </span>
          </div>
        )}
      </div>

      {/* Collapsed: stack of logos */}
      {!open && (
        <div className="flex flex-1 flex-col items-center gap-3 pt-2">
          {integrations.map((it) => (
            <button
              key={it.name}
              onClick={onToggle}
              aria-label={`${it.name}: ${statusStyles[it.status].label}`}
              className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow"
            >
              <Image
                src={it.logo || "/placeholder.svg"}
                alt=""
                width={18}
                height={18}
                className="size-[18px] object-contain"
              />
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-sidebar",
                  statusStyles[it.status].dot,
                )}
              />
            </button>
          ))}
        </div>
      )}

      {/* Expanded: cards */}
      {open && (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
          {integrations.map((it) => {
            const s = statusStyles[it.status]
            return (
              <div
                key={it.name}
                className="group rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background">
                    <Image
                      src={it.logo || "/placeholder.svg"}
                      alt={`${it.name} logo`}
                      width={22}
                      height={22}
                      className="size-[22px] object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {it.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {it.detail}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium",
                      s.text,
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", s.dot)} />
                    {s.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {it.meta}
                  </span>
                </div>
              </div>
            )
          })}

          <button className="mt-1 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-transparent py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
            <Plus className="size-4" />
            Add integration
          </button>

          <div className="mt-auto flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
            <RefreshCw className="size-3.5" />
            Last full sync 4 minutes ago
          </div>
        </div>
      )}
    </aside>
  )
}
