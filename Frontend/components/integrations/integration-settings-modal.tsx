'use client'

import React, { useState } from 'react'
import { X, Settings, Check, RefreshCw, Database, GitBranch } from 'lucide-react'

interface IntegrationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
}

export function IntegrationSettingsModal({
  isOpen,
  onClose,
  toolName,
}: IntegrationSettingsModalProps) {
  const [selectedRepo, setSelectedRepo] = useState('ai-engineering-assistant')
  const [selectedBranch, setSelectedBranch] = useState('main')
  const [syncInterval, setSyncInterval] = useState('Real-time Webhook')
  const [autoIndex, setAutoIndex] = useState(true)
  const [readPermission, setReadPermission] = useState(true)
  const [writePermission, setWritePermission] = useState(true)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = () => {
    setToastMsg('Settings saved successfully.')
    setTimeout(() => {
      setToastMsg(null)
      onClose()
    }, 800)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 text-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 font-mono"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Settings className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground font-sans">{toolName} Configuration</h3>
              <p className="text-[10px] text-muted-foreground">Integration Settings & Webhook Preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {toastMsg && (
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            {toastMsg}
          </div>
        )}

        {/* 1. Repository Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <GitBranch className="size-3 text-primary" /> Target Repository
          </label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="ai-engineering-assistant">ai-engineering-assistant (Active)</option>
            <option value="Google_maps">Google_maps</option>
            <option value="CuriousBees">CuriousBees</option>
            <option value="Financial-Tracker">Financial-Tracker</option>
          </select>
        </div>

        {/* 2. Branch Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Target Sync Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="main">main (Default Production)</option>
            <option value="develop">develop</option>
            <option value="feature/app-shell">feature/app-shell</option>
          </select>
        </div>

        {/* 3. Synchronization & Webhooks */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <RefreshCw className="size-3 text-emerald-500" /> Synchronization Frequency
          </label>
          <select
            value={syncInterval}
            onChange={(e) => setSyncInterval(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl p-2.5 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="Real-time Webhook">Real-time Webhooks (Recommended)</option>
            <option value="Every 15 Minutes">Every 15 Minutes</option>
            <option value="Hourly Sync">Hourly Sync</option>
            <option value="Manual Trigger Only">Manual Trigger Only</option>
          </select>
        </div>

        {/* 4. Permissions Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Access Permissions & Ingestion
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-foreground text-xs">
              <input
                type="checkbox"
                checked={autoIndex}
                onChange={(e) => setAutoIndex(e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              <span>Automatic Codebase Vector Embeddings</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-foreground text-xs">
              <input
                type="checkbox"
                checked={readPermission}
                onChange={(e) => setReadPermission(e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              <span>Read Repository Files & Commit Logs</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-foreground text-xs">
              <input
                type="checkbox"
                checked={writePermission}
                onChange={(e) => setWritePermission(e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              <span>Post Automated PR Review Comments</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="size-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  )
}
