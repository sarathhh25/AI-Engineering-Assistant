'use client'

import React from 'react'
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  ChevronRight,
  ChevronDown,
  Database,
  Terminal,
  Image,
  Package,
  Settings,
} from 'lucide-react'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  status?: 'modified' | 'added' | 'indexed' | 'unmodified'
  size?: number | null
  sha?: string | null
  children?: FileNode[] | null
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
  const isExpanded = Boolean(expandedFolders[item.id])
  const isSelected = selectedFileId === item.id

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase()
    if (lower.endsWith('.tsx') || lower.endsWith('.ts')) return <FileCode className="size-3.5 text-blue-400 shrink-0" />
    if (lower.endsWith('.jsx') || lower.endsWith('.js')) return <FileCode className="size-3.5 text-yellow-400 shrink-0" />
    if (lower.endsWith('.py')) return <FileCode className="size-3.5 text-emerald-400 shrink-0" />
    if (lower.endsWith('.json')) return <FileJson className="size-3.5 text-amber-400 shrink-0" />
    if (lower.endsWith('.css') || lower.endsWith('.scss')) return <FileCode className="size-3.5 text-sky-400 shrink-0" />
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return <FileCode className="size-3.5 text-orange-400 shrink-0" />
    if (lower.endsWith('.java') || lower.endsWith('.kt') || lower.endsWith('.kts')) return <FileCode className="size-3.5 text-rose-400 shrink-0" />
    if (lower.endsWith('.sql')) return <Database className="size-3.5 text-purple-400 shrink-0" />
    if (lower.endsWith('.sh') || lower.endsWith('.bash') || lower.endsWith('.zsh')) return <Terminal className="size-3.5 text-lime-400 shrink-0" />
    if (lower.endsWith('.rs') || lower.endsWith('.go')) return <FileCode className="size-3.5 text-cyan-400 shrink-0" />
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.svg') || lower.endsWith('.ico') || lower.endsWith('.webp')) {
      return <Image className="size-3.5 text-pink-400 shrink-0" />
    }
    if (lower.endsWith('.zip') || lower.endsWith('.tar') || lower.endsWith('.gz') || lower.endsWith('.7z')) {
      return <Package className="size-3.5 text-stone-400 shrink-0" />
    }
    if (lower.endsWith('.yml') || lower.endsWith('.yaml') || lower.endsWith('.toml') || lower.startsWith('.env')) {
      return <Settings className="size-3.5 text-amber-300 shrink-0" />
    }
    return <FileText className="size-3.5 text-muted-foreground shrink-0" />
  }

  return (
    <div className="select-none font-mono text-xs">
      <button
        onClick={() => {
          if (isFolder) onToggleFolder(item.id)
          else onSelectFile(item)
        }}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`w-full flex items-center justify-between py-1 pr-2 rounded-lg transition-colors group cursor-pointer ${
          isSelected
            ? 'bg-primary/15 text-primary font-medium border border-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="size-3 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="size-3 text-muted-foreground shrink-0" />
              )}
              <Folder className="size-3.5 text-amber-500 shrink-0" />
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
                ? 'text-amber-600 dark:text-amber-400 bg-amber-400/10'
                : item.status === 'added'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-400/10'
                : 'text-muted-foreground'
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
