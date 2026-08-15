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
  onSelectContextFile?: (filename: string) => void
  onSendFileToChat?: (filename: string) => void
}

export function RepositoryExplorer({
  initialTab = 'explorer',
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
    name: 'ai-engineering-assistant',
    owner: 'Sarath',
    branch: 'main',
    language: 'TypeScript',
    stars: 1240,
    commits_count: 342,
    open_issues_count: 8,
    open_prs_count: 4,
  })
  const [branches, setBranches] = useState<string[]>(['main', 'develop', 'feature/app-shell'])
  const [selectedBranch, setSelectedBranch] = useState('main')

  useEffect(() => {
    apiClient.fetchGitHubRepo('ai-engineering-assistant').then((res) => {
      setRepoDetails(res)
      setSelectedBranch(res.branch || 'main')
    })
    apiClient.fetchGitHubBranches('ai-engineering-assistant').then((bList) => {
      setBranches(bList)
    })
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
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
            <span className="text-muted-foreground truncate">GitHub Connected (Secure API)</span>
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
            onClick={() => showToast('git clone https://github.com/Sarath/ai-engineering-assistant copied!')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
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
            onClick={() => showToast('Repository settings opened.')}
            className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border cursor-pointer"
            title="Repository Settings"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>

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
