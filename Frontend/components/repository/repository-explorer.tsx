'use client'

import React, { useState, useEffect } from 'react'
import {
  FolderGit2,
  GitBranch,
  Download,
  GitPullRequest,
  Search,
  Settings,
  Star,
  GitCommit,
  AlertCircle,
  Code
} from 'lucide-react'

import { FileTree } from './file-tree'
import { FileNode } from './file-tree-item'
import { CodeViewer } from './code-viewer'
import { RepositorySearch } from './repository-search'
import { GitChanges } from './git-changes'
import { DiffViewer } from './diff-viewer'
import { apiClient, GitHubRepoDetails } from '@/lib/api-client'

interface RepositoryExplorerProps {
  initialTab?: 'explorer' | 'diffs'
  activeRepo?: string
  onSelectContextFile?: (filename: string) => void
  onSendFileToChat?: (filename: string) => void
}

export function RepositoryExplorer({
  initialTab = 'explorer',
  activeRepo = 'ai-engineering-assistant',
  onSelectContextFile,
  onSendFileToChat,
}: RepositoryExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>({
    id: 'app/page.tsx',
    name: 'app/page.tsx',
    type: 'file',
  })
  const [activePane, setActivePane] = useState<'explorer' | 'git'>(
    initialTab === 'diffs' ? 'git' : 'explorer'
  )
  const [diffFile, setDiffFile] = useState<string>('app/page.tsx')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // GitHub Data State
  const [repoDetails, setRepoDetails] = useState<GitHubRepoDetails>({
    name: activeRepo || 'AI-Engineering-Assistant',
    owner: 'Local Workspace',
    branch: 'main',
    language: 'TypeScript / Python',
    stars: 0,
    commits_count: 0,
    open_issues_count: 0,
    open_prs_count: 0,
  })
  const [branches, setBranches] = useState<string[]>(['main'])
  const [selectedBranch, setSelectedBranch] = useState('main')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const target = (activeRepo && activeRepo.trim()) || 'sarathhh25/AI-Engineering-Assistant'
    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.allSettled([
      apiClient.fetchGitHubRepo(target),
      apiClient.fetchGitHubBranches(target),
    ]).then(([repoRes, branchRes]) => {
      if (cancelled) return
      setIsLoading(false)

      if (repoRes.status === 'fulfilled' && repoRes.value) {
        setRepoDetails(repoRes.value)
        setSelectedBranch(repoRes.value.branch || 'main')
      } else if (repoRes.status === 'rejected') {
        const err = repoRes.reason
        setError(err?.message || `Failed to query repository '${target}' on GitHub.`)
      }

      if (branchRes.status === 'fulfilled' && branchRes.value && branchRes.value.length > 0) {
        setBranches(branchRes.value)
      }
    })

    return () => {
      cancelled = true
    }
  }, [activeRepo, refreshKey])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  const handleCopyClone = () => {
    const owner = repoDetails.owner
    const name = repoDetails.name || activeRepo
    const repoPath = owner && owner !== 'Local Workspace' ? `${owner}/${name}` : name
    const cloneUrl = `https://github.com/${repoPath}.git`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`git clone ${cloneUrl}`)
    }
    showToast(`Copied clone command: git clone ${cloneUrl}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-4 select-none antialiased h-full flex flex-col">
      {/* 1. GitHub Repository Telemetry Header Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm shrink-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <FolderGit2 className="size-4" />
            </div>

            <h1 className="text-lg font-bold tracking-tight text-foreground font-mono truncate">
              {repoDetails.owner}/{repoDetails.name}
            </h1>

            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-secondary text-amber-500 border border-border flex items-center gap-1">
                <Star className="size-3 fill-amber-500" /> {repoDetails.stars.toLocaleString()} stars
              </span>

              <span className="px-2 py-0.5 rounded-md bg-secondary text-primary border border-border">
                {repoDetails.language}
              </span>

              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <GitPullRequest className="size-3" /> {repoDetails.open_prs_count} PRs
              </span>

              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <AlertCircle className="size-3" /> {repoDetails.open_issues_count} Issues
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
            {/* Branch Selector */}
            <div className="flex items-center gap-1 text-foreground bg-secondary px-2 py-0.5 rounded-md border border-border">
              <GitBranch className="size-3 text-emerald-500 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value)
                  showToast(`Switched to branch '${e.target.value}'`)
                }}
                className="bg-transparent text-foreground outline-none text-[11px] cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-popover text-foreground">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <span>•</span>
            <span className="flex items-center gap-1">
              <GitCommit className="size-3 text-primary" /> {repoDetails.commits_count} Commits
            </span>
            <span>•</span>
            <span className="text-muted-foreground truncate">
              {isLoading ? 'Querying GitHub API...' : 'GitHub Connected (Secure API)'}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <button
            onClick={() => showToast('Repository pull sync requested.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
          >
            <GitPullRequest className="size-3.5 text-primary" />
            <span>Pull</span>
          </button>

          <button
            onClick={handleCopyClone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
            title="Copy git clone command"
          >
            <Download className="size-3.5 text-emerald-500" />
            <span>Clone</span>
          </button>

          <button
            onClick={() => showToast('Search Repository modal opened.')}
            className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border cursor-pointer"
            title="Search Repository"
          >
            <Search className="size-4" />
          </button>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border cursor-pointer"
            title="Refresh Repository Data"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate">{error}</span>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 font-medium transition-colors cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono animate-in fade-in duration-150">
          {toastMsg}
        </div>
      )}

      {/* 2. Main 2-Pane Explorer Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Explorer Pane (4 cols) */}
        <div className="md:col-span-4 rounded-2xl border border-border bg-card p-3 flex flex-col space-y-3 overflow-hidden shadow-xs">
          <RepositorySearch onSearch={(q, cat) => console.log('Searching', q, cat)} />

          {/* Left Pane Switcher */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-secondary rounded-xl border border-border text-xs">
            <button
              onClick={() => setActivePane('explorer')}
              className={`py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                activePane === 'explorer' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Files Explorer
            </button>
            <button
              onClick={() => setActivePane('git')}
              className={`py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                activePane === 'git' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Git Changes (4)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {activePane === 'explorer' ? (
              <FileTree
                selectedFileId={selectedFile?.id || null}
                onSelectFile={(file) => setSelectedFile(file)}
              />
            ) : (
              <GitChanges
                selectedFile={diffFile}
                onSelectFile={(fn) => setDiffFile(fn)}
              />
            )}
          </div>
        </div>

        {/* Right Code / Diff Viewer Pane (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-full min-h-0 overflow-hidden">
          {activePane === 'explorer' ? (
            <CodeViewer
              filename={selectedFile?.id || 'app/page.tsx'}
              onActionTrigger={(act) => showToast(`AI Action triggered: ${act}`)}
              onSelectContext={(fn) => {
                showToast(`Attached '${fn}' to Context Panel`)
                if (onSelectContextFile) onSelectContextFile(fn)
              }}
              onSendToCopilot={(fn) => {
                showToast(`Sent '${fn}' to AI Copilot Chat`)
                if (onSendFileToChat) onSendFileToChat(fn)
              }}
            />
          ) : (
            <DiffViewer filename={diffFile} />
          )}
        </div>
      </div>
    </div>
  )
}
