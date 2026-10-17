'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { FileNode, FileTreeItem } from './file-tree-item'
import { Loader2, AlertCircle, RefreshCw, FolderSearch } from 'lucide-react'

interface FileTreeProps {
  tree: FileNode[]
  selectedFileId: string | null
  onSelectFile: (file: FileNode) => void
  isLoading?: boolean
  error?: string | null
  searchQuery?: string
  onRetry?: () => void
}

function filterTree(nodes: FileNode[], query: string): { filtered: FileNode[]; matchingFolderIds: Set<string> } {
  const matchingFolderIds = new Set<string>()
  const cleanQ = query.trim().toLowerCase()

  if (!cleanQ) {
    return { filtered: nodes, matchingFolderIds }
  }

  function walk(nodeList: FileNode[], parentIds: string[]): FileNode[] {
    const matched: FileNode[] = []

    for (const node of nodeList) {
      const isFile = node.type === 'file'
      const nodeNameMatch = node.name.toLowerCase().includes(cleanQ)
      const nodeIdMatch = node.id.toLowerCase().includes(cleanQ)

      if (isFile) {
        if (nodeNameMatch || nodeIdMatch) {
          matched.push(node)
          parentIds.forEach((pid) => matchingFolderIds.add(pid))
        }
      } else {
        const subMatched = walk(node.children || [], [...parentIds, node.id])
        if (nodeNameMatch || nodeIdMatch || subMatched.length > 0) {
          matchingFolderIds.add(node.id)
          parentIds.forEach((pid) => matchingFolderIds.add(pid))
          matched.push({
            ...node,
            children: subMatched.length > 0 ? subMatched : (node.children || []),
          })
        }
      }
    }
    return matched
  }

  const filtered = walk(nodes, [])
  return { filtered, matchingFolderIds }
}

export function FileTree({
  tree = [],
  selectedFileId,
  onSelectFile,
  isLoading = false,
  error = null,
  searchQuery = '',
  onRetry,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  // Automatically expand top-level folders on initial tree load
  useEffect(() => {
    if (tree && tree.length > 0) {
      const initial: Record<string, boolean> = {}
      for (const item of tree) {
        if (item.type === 'folder') {
          initial[item.id] = true
        }
      }
      setExpandedFolders((prev) => ({ ...initial, ...prev }))
    }
  }, [tree])

  // Filter tree by search query
  const { filteredTree, matchingFolderIds } = useMemo(() => {
    const { filtered, matchingFolderIds } = filterTree(tree, searchQuery)
    return { filteredTree: filtered, matchingFolderIds }
  }, [tree, searchQuery])

  // Auto-expand matching folders when searching
  useEffect(() => {
    if (searchQuery.trim() && matchingFolderIds.size > 0) {
      setExpandedFolders((prev) => {
        const next = { ...prev }
        matchingFolderIds.forEach((id) => {
          next[id] = true
        })
        return next
      })
    }
  }, [searchQuery, matchingFolderIds])

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }))
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-2 select-none animate-pulse">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />
          <span>Fetching repository tree...</span>
        </div>
        <div className="space-y-1.5 pt-2">
          {[80, 60, 90, 70, 85, 65, 75].map((w, idx) => (
            <div key={idx} className="flex items-center gap-2 py-1">
              <div className="size-3.5 rounded bg-muted/60 shrink-0" />
              <div className="h-3 rounded bg-muted/60" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/20 hover:bg-destructive/30 font-medium transition-colors cursor-pointer text-[11px]"
          >
            <RefreshCw className="size-3" />
            <span>Retry Tree Load</span>
          </button>
        )}
      </div>
    )
  }

  if (!filteredTree || filteredTree.length === 0) {
    return (
      <div className="p-6 text-center select-none space-y-2 font-mono text-xs text-muted-foreground">
        <FolderSearch className="size-8 mx-auto text-muted-foreground/40" />
        {searchQuery ? (
          <div>No files matching <span className="text-foreground font-semibold">"{searchQuery}"</span></div>
        ) : (
          <div>This repository or branch contains no files.</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-0.5 select-none font-mono">
      {filteredTree.map((item) => (
        <FileTreeItem
          key={item.id}
          item={item}
          selectedFileId={selectedFileId}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolder}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  )
}
