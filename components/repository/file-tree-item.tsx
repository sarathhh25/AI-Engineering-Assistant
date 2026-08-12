'use client'

import React from 'react'
import {
  Folder,
  FileCode,
  FileText,
  FileJson,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  status?: 'modified' | 'added' | 'indexed'
  children?: FileNode[]
}

interface FileTreeItemProps {
  item: FileNode
  depth?: number
  selectedFileId: string | null
  expandedFolders: Record<string, boolean>
  onToggleFolder: (id: string) => void
  onSelectFile: (item: FileNode) => void
}

export function FileTreeItem({
  item,
  depth = 0,
  selectedFileId,
  expandedFolders,
  onToggleFolder,
  onSelectFile,
}: FileTreeItemProps) {
  const isFolder = item.type === 'folder'
  const isExpanded = expandedFolders[item.id]
  const isSelected = selectedFileId === item.id

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return <FileCode className="size-3.5 text-blue-400 shrink-0" />
    if (fileName.endsWith('.css')) return <FileCode className="size-3.5 text-sky-300 shrink-0" />
    if (fileName.endsWith('.py')) return <FileCode className="size-3.5 text-emerald-400 shrink-0" />
    if (fileName.endsWith('.json')) return <FileJson className="size-3.5 text-amber-400 shrink-0" />
    return <FileText className="size-3.5 text-zinc-400 shrink-0" />
  }

  return (
    <div className="select-none font-mono text-xs">
      <button
        onClick={() => {
          if (isFolder) onToggleFolder(item.id)
          else onSelectFile(item)
        }}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`w-full flex items-center justify-between py-1 pr-2 rounded-md transition-colors group ${
          isSelected
            ? 'bg-blue-500/15 text-blue-300 font-medium'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="size-3 text-zinc-500 shrink-0" />
              ) : (
                <ChevronRight className="size-3 text-zinc-500 shrink-0" />
              )}
              <Folder className="size-3.5 text-amber-400/80 group-hover:text-amber-400 shrink-0" />
            </>
          ) : (
            <>
              <span className="w-3 shrink-0" />
              {getFileIcon(item.name)}
            </>
          )}
          <span className="truncate text-[11px]">{item.name}</span>
        </div>

        {!isFolder && item.status && (
          <span
            className={`text-[9px] font-mono px-1 rounded uppercase font-semibold ${
              item.status === 'modified'
                ? 'text-amber-400 bg-amber-400/10'
                : item.status === 'added'
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-zinc-500'
            }`}
          >
            {item.status === 'modified' ? 'M' : item.status === 'added' ? 'A' : '✓'}
          </span>
        )}
      </button>

      {isFolder && isExpanded && item.children && (
        <div className="space-y-0.5">
          {item.children.map((child) => (
            <FileTreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              selectedFileId={selectedFileId}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}
