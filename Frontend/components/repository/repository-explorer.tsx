'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  Loader2,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'

import { FileTree } from './file-tree'
import { FileNode } from './file-tree-item'
import { CodeViewer } from './code-viewer'
import { RepositorySearch, SearchCategory } from './repository-search'
import { GitChanges } from './git-changes'
import {
  apiClient,
  GitHubRepoDetails,
  GitHubBranchDetail,
  GitHubCommitDetail,
} from '@/lib/api-client'

interface RepositoryExplorerProps {
  initialTab?: 'explorer' | 'diffs'
  activeRepo?: string
  onSelectContextFile?: (filename: string) => void
  onSendFileToChat?: (filename: string) => void
}

export function RepositoryExplorer({
  initialTab = 'explorer',
  activeRepo = '',
  onSelectContextFile,
  onSendFileToChat,
}: RepositoryExplorerProps) {
  // 1. Resolved Target Repository Name
  const [resolvedRepo, setResolvedRepo] = useState<string>(activeRepo || '')

  // 2. Telemetry State
  const [repoDetails, setRepoDetails] = useState<GitHubRepoDetails>({
    name: activeRepo || 'Loading Repository...',
    owner: 'GitHub',
    branch: 'main',
    language: 'Code',
    stars: 0,
    commits_count: 0,
    open_issues_count: 0,
    open_prs_count: 0,
  })
  const [repoLoading, setRepoLoading] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)

  // 3. Branches State
  const [branches, setBranches] = useState<GitHubBranchDetail[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('main')
  const [branchesLoading, setBranchesLoading] = useState(false)
  const [branchesError, setBranchesError] = useState<string | null>(null)

  // 4. File Tree State
  const [tree, setTree] = useState<FileNode[]>([])
  const [treeLoading, setTreeLoading] = useState(false)
  const [treeError, setTreeError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 5. Code Viewer State
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileIsBinary, setFileIsBinary] = useState(false)
  const [fileIsTruncated, setFileIsTruncated] = useState(false)
  const [fileLanguage, setFileLanguage] = useState('plaintext')
  const [fileSize, setFileSize] = useState<number | undefined>(undefined)

  // 6. Commits & Changes State
  const [activePane, setActivePane] = useState<'explorer' | 'git'>(
    initialTab === 'diffs' ? 'git' : 'explorer'
  )
  const [commits, setCommits] = useState<GitHubCommitDetail[]>([])
  const [latestCommit, setLatestCommit] = useState<GitHubCommitDetail | null>(null)
  const [commitsLoading, setCommitsLoading] = useState(false)
  const [commitsError, setCommitsError] = useState<string | null>(null)
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null)

  // 7. General UI Feedback State
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isPulling, setIsPulling] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Resolve active repository if prop is empty
  useEffect(() => {
    if (activeRepo && activeRepo.trim()) {
      setResolvedRepo(activeRepo.trim())
      return
    }

    // Check localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('copilot_active_repo')
      if (saved && saved.trim()) {
        setResolvedRepo(saved.trim())
        return
      }
    }

    // Fall back to querying connected GitHub status
    apiClient.getGitHubStatus().then((status) => {
      if (status.selected_repo && status.selected_repo.trim()) {
        setResolvedRepo(status.selected_repo.trim())
      } else {
        setResolvedRepo('sinuarlowbaby/Curious-Bee-AI-Module')
      }
    }).catch(() => {
      setResolvedRepo('sinuarlowbaby/Curious-Bee-AI-Module')
    })
  }, [activeRepo])

  // Clear stale data immediately whenever repository changes
  useEffect(() => {
    setSelectedFile(null)
    setFileContent(null)
    setFileError(null)
    setTree([])
    setTreeError(null)
    setBranches([])
    setBranchesError(null)
    setCommits([])
    setLatestCommit(null)
    setCommitsError(null)
  }, [resolvedRepo])

  // Load Repository Telemetry & Branches
  useEffect(() => {
    if (!resolvedRepo) return
    let cancelled = false

    setRepoLoading(true)
    setRepoError(null)
    setBranchesLoading(true)
    setBranchesError(null)

    // Fetch Repo Telemetry
    apiClient.fetchGitHubRepo(resolvedRepo)
      .then((data) => {
        if (cancelled) return
        setRepoDetails(data)
        setRepoLoading(false)
      })
      .catch((err: any) => {
        if (cancelled) return
        setRepoLoading(false)
        setRepoError(err?.message || `Failed to fetch repository metadata for '${resolvedRepo}'.`)
      })

    // Fetch Real Accessible Branches
    apiClient.fetchGitHubBranchesDetails(resolvedRepo)
      .then((res) => {
        if (cancelled) return
        setBranchesLoading(false)
        if (res.branches && res.branches.length > 0) {
          setBranches(res.branches)
          // Preserve selectedBranch if it exists in new branches, else select default_branch
          const currentExists = res.branches.some((b) => b.name === selectedBranch)
          if (!currentExists || !selectedBranch) {
            setSelectedBranch(res.default_branch || res.branches[0].name)
          }
        } else {
          setBranches([])
          setSelectedBranch(res.default_branch || 'main')
        }
      })
      .catch((err: any) => {
        if (cancelled) return
        setBranchesLoading(false)
        setBranchesError(err?.message || `Failed to retrieve branches for '${resolvedRepo}'.`)
        setBranches([])
      })

    return () => {
      cancelled = true
    }
  }, [resolvedRepo, refreshKey])

  // Load File Tree and Commits whenever resolvedRepo or selectedBranch changes
  useEffect(() => {
    if (!resolvedRepo || !selectedBranch) return
    let cancelled = false

    // Clear stale tree and code viewer contents immediately
    setSelectedFile(null)
    setFileContent(null)
    setFileError(null)
    setTreeLoading(true)
    setTreeError(null)
    setCommitsLoading(true)
    setCommitsError(null)

    // 1. Fetch Git Tree
    apiClient.fetchGitHubTree(resolvedRepo, selectedBranch)
      .then((treeRes) => {
        if (cancelled) return
        setTreeLoading(false)
        if (treeRes.tree) {
          setTree(treeRes.tree)
          // Find first top-level file to display preview (prefer README.md)
          const readme = treeRes.tree.find((n) => n.type === 'file' && n.name.toLowerCase() === 'readme.md')
          const firstFile = readme || treeRes.tree.find((n) => n.type === 'file')
          if (firstFile) {
            setSelectedFile(firstFile)
          }
        } else {
          setTree([])
        }
      })
      .catch((err: any) => {
        if (cancelled) return
        setTreeLoading(false)
        setTreeError(err?.message || `Failed to retrieve file tree for branch '${selectedBranch}'.`)
        setTree([])
      })

    // 2. Fetch Commits
    apiClient.fetchGitHubCommits(resolvedRepo, selectedBranch, 15)
      .then((cRes) => {
        if (cancelled) return
        setCommitsLoading(false)
        setCommits(cRes.commits || [])
        setLatestCommit(cRes.latest_commit || (cRes.commits && cRes.commits[0]) || null)
      })
      .catch((err: any) => {
        if (cancelled) return
        setCommitsLoading(false)
        setCommitsError(err?.message || `Failed to retrieve commit history for '${selectedBranch}'.`)
        setCommits([])
        setLatestCommit(null)
      })

    return () => {
      cancelled = true
    }
  }, [resolvedRepo, selectedBranch, refreshKey])

  // Load File Content whenever selectedFile changes
  useEffect(() => {
    if (!resolvedRepo || !selectedBranch || !selectedFile) {
      setFileContent(null)
      setFileError(null)
      return
    }

    if (selectedFile.type === 'folder') {
      return
    }

    let cancelled = false
    setFileLoading(true)
    setFileError(null)
    setFileContent(null)
    setFileIsBinary(false)
    setFileIsTruncated(false)

    apiClient.fetchGitHubFileContent(resolvedRepo, selectedFile.id, selectedBranch)
      .then((data) => {
        if (cancelled) return
        setFileLoading(false)
        setFileContent(data.content)
        setFileIsBinary(Boolean(data.is_binary))
        setFileIsTruncated(Boolean(data.is_truncated))
        setFileLanguage(data.language || 'plaintext')
        setFileSize(data.size)
      })
      .catch((err: any) => {
        if (cancelled) return
        setFileLoading(false)
        setFileError(err?.message || `Failed to fetch '${selectedFile.id}' from GitHub.`)
        setFileContent(null)
      })

    return () => {
      cancelled = true
    }
  }, [resolvedRepo, selectedBranch, selectedFile])

  // Action: Copy clone command
  const handleCopyClone = () => {
    const owner = repoDetails.owner
    const name = repoDetails.name || resolvedRepo
    const repoPath = owner && owner !== 'Local Workspace' && owner !== 'GitHub'
      ? `${owner}/${name}`
      : (resolvedRepo.includes('/') ? resolvedRepo : name)

    const cloneUrl = `https://github.com/${repoPath}.git`
    const command = selectedBranch && selectedBranch !== 'main'
      ? `git clone -b ${selectedBranch} ${cloneUrl}`
      : `git clone ${cloneUrl}`

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(command)
    }
    showToast(`Copied: ${command}`)
  }

  // Action: Pull / Sync remote branch
  const handlePullSync = async () => {
    setIsPulling(true)
    try {
      await apiClient.syncGitHubRepository(resolvedRepo)
      setRefreshKey((k) => k + 1)
      showToast(`Branch '${selectedBranch}' synchronized with remote GitHub repository.`)
    } catch (err: any) {
      showToast(`Sync failed: ${err.message || 'Unable to sync repository'}`)
    } finally {
      setIsPulling(false)
    }
  }

  // Branch Selection Handler
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = e.target.value
    setSelectedBranch(newBranch)
    showToast(`Switched to branch '${newBranch}'`)
  }

  // File Select Handler from FileTree
  const handleSelectFile = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file)
    }
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
              {repoDetails.owner && repoDetails.owner !== 'GitHub' && repoDetails.owner !== 'Local Workspace'
                ? `${repoDetails.owner}/${repoDetails.name}`
                : (resolvedRepo || repoDetails.name)}
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

          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground flex-wrap">
            {/* Branch Selector */}
            <div className="flex items-center gap-1 text-foreground bg-secondary px-2 py-0.5 rounded-md border border-border">
              <GitBranch className="size-3 text-emerald-500 shrink-0" />
              {branchesLoading ? (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-2.5 animate-spin" /> Loading branches...
                </span>
              ) : (
                <select
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  className="bg-transparent text-foreground outline-none text-[11px] cursor-pointer"
                  title="Select GitHub branch"
                >
                  {branches.length > 0 ? (
                    branches.map((b) => (
                      <option key={b.name} value={b.name} className="bg-popover text-foreground">
                        {b.name} {b.is_default ? '(default)' : ''}
                      </option>
                    ))
                  ) : (
                    <option value={selectedBranch} className="bg-popover text-foreground">
                      {selectedBranch || 'main'}
                    </option>
                  )}
                </select>
              )}
            </div>

            {/* Latest Commit Preview */}
            {latestCommit && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-foreground truncate max-w-[240px] sm:max-w-[320px]" title={latestCommit.message}>
                  <GitCommit className="size-3 text-primary shrink-0" />
                  <span className="text-primary font-bold">{latestCommit.short_sha}:</span>
                  <span className="truncate text-muted-foreground">{latestCommit.message}</span>
                </span>
              </>
            )}

            <span>•</span>
            <span className="text-muted-foreground truncate">
              {repoLoading || treeLoading ? 'Querying GitHub API...' : 'GitHub Connected (Authenticated)'}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <button
            onClick={handlePullSync}
            disabled={isPulling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer disabled:opacity-50"
            title="Synchronize and fetch latest tree from GitHub"
          >
            {isPulling ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <GitPullRequest className="size-3.5 text-primary" />
            )}
            <span>Pull Sync</span>
          </button>

          <button
            onClick={handleCopyClone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
            title="Copy git clone command for this branch"
          >
            <Download className="size-3.5 text-emerald-500" />
            <span>Clone</span>
          </button>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border cursor-pointer"
            title="Refresh Repository Data"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {(repoError || branchesError) && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate">{repoError || branchesError}</span>
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
          <RepositorySearch
            onSearch={(q) => setSearchQuery(q)}
          />

          {/* Left Pane Switcher */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-secondary rounded-xl border border-border text-xs">
            <button
              onClick={() => setActivePane('explorer')}
              className={`py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                activePane === 'explorer'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Files Explorer
            </button>
            <button
              onClick={() => setActivePane('git')}
              className={`py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                activePane === 'git'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Branch Commits ({commits.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {activePane === 'explorer' ? (
              <FileTree
                tree={tree}
                selectedFileId={selectedFile?.id || null}
                onSelectFile={handleSelectFile}
                isLoading={treeLoading}
                error={treeError}
                searchQuery={searchQuery}
                onRetry={() => setRefreshKey((k) => k + 1)}
              />
            ) : (
              <GitChanges
                repo={resolvedRepo}
                branch={selectedBranch}
                commits={commits}
                selectedCommitSha={selectedCommitSha}
                onSelectCommit={(c) => setSelectedCommitSha(c.sha)}
                isLoading={commitsLoading}
                error={commitsError}
                onRetry={() => setRefreshKey((k) => k + 1)}
              />
            )}
          </div>
        </div>

        {/* Right Code Viewer Pane (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-full min-h-0 overflow-hidden">
          <CodeViewer
            filename={selectedFile?.id || ''}
            repo={resolvedRepo}
            branch={selectedBranch}
            codeContent={fileContent}
            isLoading={fileLoading}
            error={fileError}
            isBinary={fileIsBinary}
            isTruncated={fileIsTruncated}
            language={fileLanguage}
            fileSize={fileSize}
            onRetry={() => {
              if (selectedFile) {
                setSelectedFile({ ...selectedFile })
              }
            }}
            onSelectContext={(fn) => {
              showToast(`Attached '${fn}' to Context Panel`)
              if (onSelectContextFile) onSelectContextFile(fn)
            }}
            onSendToCopilot={(fn) => {
              showToast(`Sent '${fn}' to AI Copilot Chat`)
              if (onSendFileToChat) onSendFileToChat(fn)
            }}
          />
        </div>
      </div>
    </div>
  )
}
