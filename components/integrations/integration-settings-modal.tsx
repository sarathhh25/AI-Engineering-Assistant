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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 text-xs select-none">
      <div className="w-full max-w-lg bg-[#121215] border border-white/15 rounded-xl shadow-2xl p-5 space-y-4 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Settings className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100 font-sans">{toolName} Configuration</h3>
              <p className="text-[10px] text-zinc-400">Integration Settings & Webhook Preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {toastMsg && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            {toastMsg}
          </div>
        )}

        {/* 1. Repository Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <GitBranch className="size-3 text-blue-400" /> Target Repository
          </label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
          >
            <option value="ai-engineering-assistant">ai-engineering-assistant (Active)</option>
            <option value="Google_maps">Google_maps</option>
            <option value="CuriousBees">CuriousBees</option>
            <option value="Financial-Tracker">Financial-Tracker</option>
          </select>
        </div>

        {/* 2. Branch Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Target Sync Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
          >
            <option value="main">main (Default Production)</option>
            <option value="develop">develop</option>
            <option value="feature/app-shell">feature/app-shell</option>
          </select>
        </div>

        {/* 3. Synchronization & Webhooks */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <RefreshCw className="size-3 text-emerald-400" /> Synchronization Frequency
          </label>
          <select
            value={syncInterval}
            onChange={(e) => setSyncInterval(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
          >
            <option value="Real-time Webhook">Real-time Webhook (Recommended)</option>
            <option value="Every 15 Minutes">Every 15 Minutes</option>
            <option value="Hourly">Hourly</option>
            <option value="Manual Only">Manual Only</option>
          </select>
        </div>

        {/* 4. Vector Indexing Options */}
        <div className="p-3 rounded-lg bg-zinc-950/80 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
              <Database className="size-3.5 text-purple-400" /> Automatic Vector RAG Indexing
            </span>
            <button
              onClick={() => setAutoIndex((prev) => !prev)}
              className={`size-4 rounded border flex items-center justify-center ${
                autoIndex ? 'bg-blue-600 border-blue-500 text-white' : 'border-zinc-600 bg-zinc-900'
              }`}
            >
              {autoIndex && <Check className="size-3" />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
            Automatically chunk and generate vector embeddings when commits or issues update.
          </p>
        </div>

        {/* 5. Permissions requested */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Integration Permissions
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-white/5 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={readPermission}
                onChange={(e) => setReadPermission(e.target.checked)}
              />
              <span>Read Repos & Issues</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-white/5 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={writePermission}
                onChange={(e) => setWritePermission(e.target.checked)}
              />
              <span>Write PR Comments</span>
            </label>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-sans transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
