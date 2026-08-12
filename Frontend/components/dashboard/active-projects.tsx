'use client'

import React from 'react'
import { ProjectCard, ProjectItem } from './project-card'

const PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    name: 'AI Engineering Assistant',
    repo: 'ai-engineering-assistant',
    language: 'TypeScript',
    branch: 'main',
    lastActivity: '2m ago',
    status: 'Active',
  },
  {
    id: 'p2',
    name: 'Google Maps Route Optimizer',
    repo: 'Google_maps',
    language: 'Python',
    branch: 'main',
    lastActivity: '1h ago',
    status: 'Active',
  },
  {
    id: 'p3',
    name: 'CuriousBees',
    repo: 'CuriousBees',
    language: 'Python',
    branch: 'main',
    lastActivity: '3h ago',
    status: 'Active',
  },
  {
    id: 'p4',
    name: 'Financial Tracker',
    repo: 'Financial-Tracker',
    language: 'Python',
    branch: 'main',
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
    else alert(`Opening project ${project.name}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h2 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
          Active Projects ({PROJECTS.length})
        </h2>
        <span className="text-zinc-500 text-[10px]">Workspace Projects</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROJECTS.map((proj) => (
          <ProjectCard key={proj.id} project={proj} onOpen={handleOpen} />
        ))}
      </div>
    </div>
  )
}
