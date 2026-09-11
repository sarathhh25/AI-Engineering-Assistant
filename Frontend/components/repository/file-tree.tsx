'use client'

import React, { useState } from 'react'
import { FileNode, FileTreeItem } from './file-tree-item'

export const DEMO_FILE_TREE: FileNode[] = [
  {
    id: 'app',
    name: 'app',
    type: 'folder',
    children: [
      { id: 'app/layout.tsx', name: 'layout.tsx', type: 'file', status: 'indexed' },
      { id: 'app/page.tsx', name: 'page.tsx', type: 'file', status: 'modified' },
      { id: 'app/globals.css', name: 'globals.css', type: 'file', status: 'modified' },
    ],
  },
  {
    id: 'components',
    name: 'components',
    type: 'folder',
    children: [
      { id: 'components/app-shell.tsx', name: 'app-shell.tsx', type: 'file', status: 'added' },
      { id: 'components/sidebar-left.tsx', name: 'sidebar-left.tsx', type: 'file', status: 'modified' },
      { id: 'components/top-nav.tsx', name: 'top-nav.tsx', type: 'file', status: 'modified' },
      { id: 'components/workspace-main.tsx', name: 'workspace-main.tsx', type: 'file', status: 'added' },
    ],
  },
  {
    id: 'lib',
    name: 'lib',
    type: 'folder',
    children: [
      { id: 'lib/utils.ts', name: 'utils.ts', type: 'file', status: 'indexed' },
    ],
  },
  {
    id: 'backend',
    name: 'backend',
    type: 'folder',
    children: [
      { id: 'backend/main.py', name: 'main.py', type: 'file', status: 'modified' },
      { id: 'backend/__init__.py', name: '__init__.py', type: 'file', status: 'indexed' },
    ],
  },
  { id: 'README.md', name: 'README.md', type: 'file', status: 'indexed' },
  { id: 'package.json', name: 'package.json', type: 'file', status: 'indexed' },
]

interface FileTreeProps {
  selectedFileId: string | null
  onSelectFile: (file: FileNode) => void
}

export function FileTree({ selectedFileId, onSelectFile }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    app: true,
    components: true,
    backend: true,
  })

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }))
  }

  return (
    <div className="space-y-0.5 select-none">
      {DEMO_FILE_TREE.map((item) => (
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
