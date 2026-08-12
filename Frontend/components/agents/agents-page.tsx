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
    } catch (e: any) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot className="size-3.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Autonomous AI Agents
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Execute specialized engineering agents for code review, debugging, testing, and architecture refactoring.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
            8 Agents Ready
          </span>
        </div>
      </div>

      {/* Agents Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agentsList.map((agent) => {
          const Icon = agent.icon
          const isSelected = selectedAgent.id === agent.id
          const isRunning = agent.status === 'Running'

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                isSelected
                  ? 'bg-zinc-900 border-blue-500/40 shadow-xl'
                  : 'bg-zinc-900/60 border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <Icon className="size-5" />
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                      isRunning
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                        : agent.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-white/5'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-xs text-zinc-100 group-hover:text-blue-400 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                    {agent.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Model: {agent.model}</span>
                <span>{agent.recentExecutionsCount} runs</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Agent Control Panel */}
      {selectedAgent && (
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-white/10 space-y-5 shadow-2xl select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <selectedAgent.icon className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{selectedAgent.name}</h2>
                <p className="text-xs text-zinc-400">{selectedAgent.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {runningAgentId === selectedAgent.id ? (
                <button
                  onClick={() => handleStopAgent(selectedAgent.id)}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold transition-all flex items-center gap-1.5"
                >
                  <Square className="size-3.5 fill-red-300" />
                  <span>Stop Agent</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStartAgent(selectedAgent.id)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Play className="size-3.5 fill-white" />
                  <span>Start Agent</span>
                </button>
              )}
            </div>
          </div>

          {/* Capabilities & Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] space-y-2">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Tools & Integrations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.tools.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-zinc-800 text-blue-400 text-[10px] border border-white/5">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] space-y-2">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Capabilities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.capabilities.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded bg-zinc-800 text-purple-400 text-[10px] border border-white/5">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Execution View */}
          {(runningAgentId === selectedAgent.id || selectedAgent.status === 'Running') && (
            <AgentExecution
              agentName={selectedAgent.name}
              currentStepIndex={activeStepIndex}
              steps={DEMO_STEPS}
            />
          )}

          {/* Agent Output View */}
          {showOutput && agentOutputData && (
            <AgentOutput
              agentName={selectedAgent.name}
              output={agentOutputData}
              onApprove={() => alert('Agent modifications approved and merged.')}
              onReject={() => alert('Agent changes rejected.')}
              onRetry={() => handleStartAgent(selectedAgent.id)}
            />
          )}
        </div>
      )}
    </div>
  )
}
