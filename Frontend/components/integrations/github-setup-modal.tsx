'use client'

import React, { useState } from 'react'
import { GitPullRequest, ExternalLink, Copy, Check, ShieldCheck, AlertTriangle, X } from 'lucide-react'

interface GitHubSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckAgain: () => Promise<void>
}

export function GitHubSetupModal({ isOpen, onClose, onCheckAgain }: GitHubSetupModalProps) {
  const [copiedCallback, setCopiedCallback] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<string | null>(null)

  const callbackUrl = 'http://localhost:8000/api/integrations/github/callback'

  if (!isOpen) return null

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl)
    setCopiedCallback(true)
    setTimeout(() => setCopiedCallback(false), 2000)
  }

  const handleCheck = async () => {
    setIsChecking(true)
    setCheckResult(null)
    try {
      await onCheckAgain()
    } catch (e: any) {
      setCheckResult(e.message || 'Still not configured.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden text-xs flex flex-col space-y-4 p-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <GitPullRequest className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                GitHub OAuth Setup Required
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Configure your official GitHub application to connect real repositories.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3.5 pt-1 text-xs">
          {/* Notice box */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[11px]">Real GitHub OAuth credentials required</p>
              <p className="text-[10px] text-amber-500/90 leading-relaxed">
                To prevent mock connections, the assistant communicates directly with GitHub.com.
                Register a free OAuth app in your GitHub Developer Settings to enable real authentication.
              </p>
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-1.5 p-3 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                <span className="size-4 rounded-full bg-primary/20 text-primary text-[10px] font-mono flex items-center justify-center font-bold">1</span>
                Register OAuth App on GitHub
              </span>
              <a
                href="https://github.com/settings/applications/new"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <span>GitHub Developer Settings</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Set Application Name to <code className="bg-secondary px-1 py-0.5 rounded text-foreground font-mono">AI Engineering Assistant</code> and Homepage URL to <code className="bg-secondary px-1 py-0.5 rounded text-foreground font-mono">http://localhost:3000</code>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2 p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <span className="size-4 rounded-full bg-primary/20 text-primary text-[10px] font-mono flex items-center justify-center font-bold">2</span>
              Set Authorization Callback URL
            </span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={callbackUrl}
                className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-foreground focus:outline-hidden"
              />
              <button
                onClick={handleCopyCallback}
                className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0 font-medium"
                title="Copy callback URL"
              >
                {copiedCallback ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-500 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-1.5 p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <span className="size-4 rounded-full bg-primary/20 text-primary text-[10px] font-mono flex items-center justify-center font-bold">3</span>
              Add Credentials to your <code className="font-mono text-primary">.env</code> file
            </span>
            <div className="bg-background border border-border rounded-lg p-2.5 font-mono text-[10px] text-muted-foreground space-y-1">
              <div>GITHUB_CLIENT_ID=your_client_id_here</div>
              <div>GITHUB_CLIENT_SECRET=your_client_secret_here</div>
              <div className="text-zinc-600 dark:text-zinc-400"># Optional override:</div>
              <div>GITHUB_REDIRECT_URI={callbackUrl}</div>
            </div>
          </div>

          {checkResult && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[11px]">
              {checkResult}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs transition-colors border border-border cursor-pointer font-medium"
          >
            Close
          </button>

          <button
            onClick={handleCheck}
            disabled={isChecking}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <ShieldCheck className="size-3.5" />
            <span>{isChecking ? 'Checking Credentials...' : 'Check Configuration Again'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
