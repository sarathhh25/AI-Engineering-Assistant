'use client'

import React from 'react'
import { ProjectCard, ProjectItem } from './project-card'

const PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    name: 'AI Engineering Assistant Copilot',
    repo: 'Core Assistant Workspace',
    language: 'Full-Stack',
    branch: 'Sprint 14',
    lastActivity: 'Active',
    status: 'Active',
  },
  {
    id: 'p2',
    name: 'API Security & Rate Limiter',
    repo: 'Backend Security Architecture',
    language: 'FastAPI / Python',
    branch: 'Sprint 14',
    lastActivity: '1h ago',
    status: 'Active',
  },
  {
    id: 'p3',
    name: 'Repository Context Engine',
    repo: 'Vector Analysis Pipeline',
    language: 'Next.js / TypeScript',
    branch: 'Sprint 14',
    lastActivity: '3h ago',
    status: 'Active',
  },
  {
    id: 'p4',
    name: 'OAuth Token Encryption & Audit',
    repo: 'DevOps & Identity',
    language: 'Cryptographic Services',
    branch: 'Sprint 13',
    lastActivity: '1d ago',
    status: 'Completed',
  },
]

interface ActiveProjectsProps {
  onOpenProject?: (project: ProjectItem) => void
}

export function ActiveProjects({ onOpenProject }: ActiveProjectsProps) {
  const handleOpen = (project: ProjectItem) => {
    if (onOpenProject) onOpenProject(project)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
          Workspace Project Modules ({PROJECTS.length})
        </h2>
        <span className="text-zinc-500 text-[10px]">Workspace Organization</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROJECTS.map((proj) => (
          <ProjectCard key={proj.id} project={proj} onOpen={handleOpen} />
        ))}
      </div>
    </div>
  )
}
