'use client'

import React, { useState } from 'react'
import {
  Bot,
  Play,
  Square,
  GitPullRequest,
  Bug,
  FileText,
  FlaskConical,
  Layers,
  ShieldAlert,
  FolderGit2,
  Terminal,
  Sparkles,
  Search,
} from 'lucide-react'

import { AgentExecution, WorkflowStep } from './agent-execution'
import { AgentOutput, AgentOutputData } from './agent-output'
import { apiClient } from '@/lib/api-client'

export interface AgentItem {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'Idle' | 'Running' | 'Completed'
  model: string
  tools: string[]
  capabilities: string[]
  recentExecutionsCount: number
}

const AGENTS: AgentItem[] = [
  {
    id: 'code-review',
    name: 'Code Review Agent',
    description: 'Automated PR inspection, code quality checks, and architectural review.',
    icon: GitPullRequest,
    status: 'Idle',
    model: 'Claude 3.7 Sonnet',
    tools: ['AST Parser', 'ESLint', 'Git Diff Engine'],
    capabilities: ['Type Safety Inspection', 'Design Pattern Verification', 'PR Comments'],
    recentExecutionsCount: 24,
  },
  {
    id: 'debugging',
    name: 'Debugging Agent',
    description: 'Trace runtime error logs, isolate memory leaks, and generate bug patches.',
    icon: Bug,
    status: 'Idle',
    model: 'Claude 3.7 Sonnet',
    tools: ['Pdb Tracing', 'FastAPI Logger', 'Stack Analyzer'],
    capabilities: ['Root Cause Analysis', 'Memory Leak Detection', 'Automated Patching'],
    recentExecutionsCount: 18,
  },
  {
    id: 'documentation',
    name: 'Documentation Agent',
    description: 'Generate OpenAPI schemas, JSDoc strings, and architecture READMEs.',
    icon: FileText,
    status: 'Idle',
    model: 'GPT-4.1',
    tools: ['OpenAPI Generator', 'Markdown Renderer'],
    capabilities: ['Docstring Ingestion', 'API Spec Extraction', 'Architecture Diagrams'],
    recentExecutionsCount: 12,
  },
  {
    id: 'testing',
    name: 'Testing Agent',
    description: 'Create unit, integration, and end-to-end mock test suites.',
    icon: FlaskConical,
    status: 'Idle',
    model: 'Claude 3.7 Sonnet',
    tools: ['Pytest Runner', 'Jest Test Engine', 'Coverage Reporter'],
    capabilities: ['Boundary Testing', 'Mock Fixture Generation', 'Regression Coverage'],
    recentExecutionsCount: 31,
  },
  {
    id: 'architecture',
    name: 'Architecture Agent',
    description: 'Analyze repository boundaries, dependency graphs, and module decoupling.',
    icon: Layers,
    status: 'Idle',
    model: 'Gemini 2.5 Pro',
    tools: ['Dependency Grapher', 'Module Inspector'],
    capabilities: ['Circular Dependency Check', 'Layer Decoupling', 'RFC Specs'],
    recentExecutionsCount: 9,
  },
  {
    id: 'security',
    name: 'Security Agent',
    description: 'Scan vulnerabilities, hardcoded credentials, and unsafe CORS configs.',
    icon: ShieldAlert,
    status: 'Idle',
    model: 'Claude 3.7 Sonnet',
    tools: ['Snyk Vulnerability Scanner', 'Secret Detector'],
    capabilities: ['OWASP Top 10 Audit', 'Secret Key Redaction', 'CORS Verification'],
    recentExecutionsCount: 15,
  },
  {
    id: 'repo-analysis',
    name: 'Repository Analysis Agent',
    description: 'Full repository vector embedding indexer and structural analysis.',
    icon: FolderGit2,
    status: 'Idle',
    model: 'Gemini 2.5 Pro',
    tools: ['Qdrant RAG Engine', 'Vector Embedder'],
    capabilities: ['Semantic Vector Indexing', 'Codebase Summarization', 'Context Building'],
    recentExecutionsCount: 42,
  },
  {
    id: 'devops',
    name: 'DevOps Agent',
    description: 'Build Docker multi-stage pipelines and GitHub Actions workflows.',
    icon: Terminal,
    status: 'Idle',
    model: 'GPT-4.1',
    tools: ['Docker Engine', 'GitHub Actions Runner'],
    capabilities: ['CI/CD Pipeline Setup', 'Container Optimization', 'Deployment Verification'],
    recentExecutionsCount: 11,
  },
]

const DEMO_STEPS: WorkflowStep[] = [
  { id: 's1', label: 'Planning', status: 'completed', logSnippet: 'Generated task execution plan across 142 files via POST /api/agent.' },
  { id: 's2', label: 'Analyzing', status: 'completed', logSnippet: 'Running AST parser and type checker against FastAPI backend...' },
  { id: 's3', label: 'Executing', status: 'running', logSnippet: 'Synthesizing code modifications and refactoring imports...' },
  { id: 's4', label: 'Validating', status: 'pending', logSnippet: 'Pending test runner verification...' },
  { id: 's5', label: 'Completed', status: 'pending', logSnippet: 'Awaiting user approval...' },
]

export function AgentsPage() {
  const [agentsList, setAgentsList] = useState<AgentItem[]>(AGENTS)
  const [selectedAgent, setSelectedAgent] = useState<AgentItem>(AGENTS[0])
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [showOutput, setShowOutput] = useState(false)
  const [agentOutputData, setAgentOutputData] = useState<AgentOutputData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAgents = agentsList.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartAgent = async (agentId: string) => {
    setRunningAgentId(agentId)
    setActiveStepIndex(0)
    setShowOutput(false)

    setAgentsList((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: 'Running' } : a))
    )

    setTimeout(() => setActiveStepIndex(1), 500)
    setTimeout(() => setActiveStepIndex(2), 1000)

    try {
      const res = await apiClient.executeAgent(agentId)

      setTimeout(() => setActiveStepIndex(3), 1500)
      setTimeout(() => {
        setActiveStepIndex(4)
        setRunningAgentId(null)
        setAgentOutputData({
          reasoningSummary: res.summary,
          filesAnalyzed: res.files_analyzed,
          changesProposed: `// Modified lib/auth.ts via POST /api/agent\n+ export async function verifySessionToken(token: string) {\n+   const user = await jwt.verify(token, PUBLIC_RSA_KEY);\n+   return user;\n+ }`,
          testsGenerated: res.tests_generated,
          warnings: res.warnings,
        })
        setShowOutput(true)
        setAgentsList((prev) =>
          prev.map((a) => (a.id === agentId ? { ...a, status: 'Completed', recentExecutionsCount: a.recentExecutionsCount + 1 } : a))
        )
      }, 2000)
    } catch {
      setRunningAgentId(null)
      setAgentsList((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: 'Idle' } : a))
      )
    }
  }

  const handleStopAgent = (agentId: string) => {
    setRunningAgentId(null)
    setAgentsList((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: 'Idle' } : a))
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 select-none antialiased">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Bot className="size-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Autonomous AI Agents
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Execute specialized engineering agents for code review, debugging, testing, and architecture refactoring.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            8 Agents Ready
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search agents by capability..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-secondary/60 border border-border focus:border-primary/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
        />
      </div>

      {/* Agents Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAgents.map((agent) => {
          const Icon = agent.icon
          const isSelected = selectedAgent.id === agent.id
          const isRunning = agent.status === 'Running'

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-xs ${
                isSelected
                  ? 'bg-card border-primary/50 shadow-md ring-1 ring-primary/20'
                  : 'bg-card border-border hover:bg-secondary/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                    <Icon className="size-5 text-primary" />
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${
                      isRunning
                        ? 'bg-primary/10 text-primary border-primary/20 animate-pulse'
                        : agent.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                    {agent.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>Model: {agent.model}</span>
                <span>{agent.recentExecutionsCount} runs</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Agent Control Panel */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              {selectedAgent.name} Control Panel
            </h2>
            <p className="text-xs text-muted-foreground">{selectedAgent.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {runningAgentId === selectedAgent.id ? (
              <button
                onClick={() => handleStopAgent(selectedAgent.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Square className="size-3.5 fill-red-500" />
                <span>Stop Agent</span>
              </button>
            ) : (
              <button
                onClick={() => handleStartAgent(selectedAgent.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                <Play className="size-3.5 fill-current" />
                <span>Execute Agent</span>
              </button>
            )}
          </div>
        </div>

        {/* Capabilities & Tools Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Capabilities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedAgent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[10px] border border-border"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Connected Tools
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedAgent.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] border border-primary/20"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Execution Workflow (Live Pipeline) */}
      {runningAgentId && (
        <AgentExecution
          agentName={selectedAgent.name}
          currentStepIndex={activeStepIndex}
          steps={DEMO_STEPS}
        />
      )}

      {/* Agent Final Output Proposal */}
      {showOutput && agentOutputData && (
        <AgentOutput
          agentName={selectedAgent.name}
          output={agentOutputData}
          onApprove={() => alert('Changes approved & committed!')}
          onReject={() => alert('Changes rejected.')}
          onRetry={() => handleStartAgent(selectedAgent.id)}
        />
      )}
    </div>
  )
}
