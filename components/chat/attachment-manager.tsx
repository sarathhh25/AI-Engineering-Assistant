'use client'

import React from 'react'
import { FileText, FileCode, Image, Archive, X, CheckCircle2 } from 'lucide-react'

export interface AttachedFile {
  id: string
  name: string
  fileName: string
  content: string
  type: string
  size: string
  progress: number // 0 - 100
}

interface AttachmentManagerProps {
  attachments: AttachedFile[]
  onRemove: (id: string) => void
}

export function AttachmentManager({ attachments, onRemove }: AttachmentManagerProps) {
  if (attachments.length === 0) return null

  const getFileIcon = (type: string) => {
    if (type.includes('image') || type.endsWith('png') || type.endsWith('jpg')) return <Image className="size-3.5 text-purple-400 shrink-0" />
    if (type.includes('json') || type.includes('code')) return <FileCode className="size-3.5 text-blue-400 shrink-0" />
    if (type.includes('zip') || type.includes('archive')) return <Archive className="size-3.5 text-amber-400 shrink-0" />
    return <FileText className="size-3.5 text-emerald-400 shrink-0" />
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-950/80 border-t border-white/[0.06] text-xs font-mono select-none">
      {attachments.map((file) => {
        const isUploading = file.progress < 100

        return (
          <div
            key={file.id}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 flex items-center gap-2 text-zinc-200 relative overflow-hidden group"
          >
            {getFileIcon(file.type)}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate text-[11px] font-medium">{file.name}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-zinc-800 text-zinc-400 font-bold border border-white/5">
                  {file.type.toUpperCase()}
                </span>
              </div>
              <span className="text-[9px] text-zinc-500">{file.size}</span>
            </div>

            {isUploading ? (
              <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-150"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            ) : (
              <CheckCircle2 className="size-3 text-emerald-400 shrink-0 ml-1" />
            )}

            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="p-0.5 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Remove File"
            >
              <X className="size-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
