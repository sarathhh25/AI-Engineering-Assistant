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
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shrink-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="size-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <FolderGit2 className="size-4" />
            </div>

            <h1 className="text-lg font-bold tracking-tight text-white font-mono truncate">
              {repoDetails.owner}/{repoDetails.name}
            </h1>

            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-white/5 flex items-center gap-1">
                <Star className="size-3 fill-amber-400" /> {repoDetails.stars.toLocaleString()} stars
              </span>

              <span className="px-2 py-0.5 rounded bg-zinc-800 text-blue-400 border border-white/5">
                {repoDetails.language}
              </span>

              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                <GitPullRequest className="size-3" /> {repoDetails.open_prs_count} PRs
              </span>

              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                <AlertCircle className="size-3" /> {repoDetails.open_issues_count} Issues
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            {/* Branch Selector */}
            <div className="flex items-center gap-1 text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-white/10">
              <GitBranch className="size-3 text-emerald-400 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value)
                  showToast(`Switched to branch '${e.target.value}'`)
                }}
                className="bg-transparent text-zinc-200 outline-none text-[11px] cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-zinc-900 text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <span>•</span>
            <span className="flex items-center gap-1">
              <GitCommit className="size-3 text-blue-400" /> {repoDetails.commits_count} Commits
            </span>
            <span>•</span>
            <span className="text-zinc-500 truncate">GitHub Connected (Secure API)</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <button
            onClick={() => showToast('Repository pull sync requested.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 transition-colors"
          >
            <GitPullRequest className="size-3.5 text-blue-400" />
            <span>Pull</span>
          </button>

          <button
            onClick={() => showToast('git clone https://github.com/Sarath/ai-engineering-assistant copied!')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 transition-colors"
          >
            <Download className="size-3.5 text-emerald-400" />
            <span>Clone</span>
          </button>

          <button
            onClick={() => showToast('Search Repository modal opened.')}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-white/10"
            title="Search Repository"
          >
            <Search className="size-4" />
          </button>

          <button
            onClick={() => showToast('Repository settings opened.')}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-white/10"
            title="Repository Settings"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono animate-in fade-in duration-150">
          {toastMsg}
        </div>
      )}

      {/* 2. Main 2-Pane Explorer Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Explorer Pane (4 cols) */}
        <div className="md:col-span-4 rounded-xl border border-white/10 bg-[#0c0c0e] p-3 flex flex-col space-y-3 overflow-hidden">
          <RepositorySearch onSearch={(q, cat) => console.log('Searching', q, cat)} />

          {/* Left Pane Switcher */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-900 rounded-lg border border-white/5 text-xs">
            <button
              onClick={() => setActivePane('explorer')}
              className={`py-1 rounded-md font-medium text-[11px] transition-all ${
                activePane === 'explorer' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Files Explorer
            </button>
            <button
              onClick={() => setActivePane('git')}
              className={`py-1 rounded-md font-medium text-[11px] transition-all ${
                activePane === 'git' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
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
