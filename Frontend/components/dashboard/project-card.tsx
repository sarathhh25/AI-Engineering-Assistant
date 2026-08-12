'use client'

import React from 'react'
import { FolderGit2, ExternalLink } from 'lucide-react'

export interface ProjectItem {
  id: string
  name: string
  repo: string
  language: string
  branch: string
  lastActivity: string
  status: 'Active' | 'Completed' | 'Building'
}

interface ProjectCardProps {
  project: ProjectItem
  onOpen?: (project: ProjectItem) => void
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <div
      onClick={() => onOpen && onOpen(project)}
      className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-3 group cursor-pointer select-none"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FolderGit2 className="size-3.5" />
            </div>
            <h3 className="font-semibold text-xs text-zinc-100 group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-medium">
            <span
              className={`size-1.5 rounded-full ${
                project.status === 'Completed' ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className={project.status === 'Completed' ? 'text-blue-400' : 'text-emerald-400'}>
              {project.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-1">
          <div>
            <span className="text-zinc-500">Repo:</span> {project.repo}
          </div>
          <div>
            <span className="text-zinc-500">Lang:</span> {project.language}
          </div>
          <div>
            <span className="text-zinc-500">Branch:</span> {project.branch}
          </div>
          <div>
            <span className="text-zinc-500">Activity:</span> {project.lastActivity}
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          if (onOpen) onOpen(project)
        }}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors border border-white/5"
      >
        <span>Open Project</span>
        <ExternalLink className="size-3 text-zinc-400" />
      </button>
    </div>
  )
}
