'use client'

import React, { useState, useEffect } from 'react'
import {
  PanelRightClose,
  FileCode,
  Sparkles,
  BookOpen,
  CheckCircle,
  Database,
  Cpu,
  Plus,
  RefreshCw,
  Hash,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  ShieldCheck,
  GitPullRequest,
  AlertCircle,
  FolderGit2,
  ExternalLink,
  Code
} from 'lucide-react'

interface ContextPanelRightProps {
  isOpen: boolean
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  selectedFile: string | null
}

export interface ReferenceItem {
  id: string
  name: string
  type: 'file' | 'function' | 'class' | 'repo' | 'pr' | 'issue'
  details: string
  tokens: string
}

export interface AIRule {
  id: string
  text: string
  enabled: boolean
  category: string
}

const DEFAULT_REFERENCES: ReferenceItem[] = [
  { id: 'ref1', name: 'app/page.tsx', type: 'file', details: 'L1 - L45', tokens: '1.2k tokens' },
  { id: 'ref2', name: 'Backend/main.py', type: 'file', details: 'L1 - L80', tokens: '850 tokens' },
  { id: 'ref3', name: 'authenticateUser()', type: 'function', details: 'lib/auth.ts', tokens: '340 tokens' },
  { id: 'ref4', name: 'AppShell', type: 'class', details: 'components/app-shell.tsx', tokens: '620 tokens' },
  { id: 'ref5', name: '#PR-42 Next.js App Shell', type: 'pr', details: 'GitHub PR', tokens: '410 tokens' },
  { id: 'ref6', name: '#104 Fix JWT Expiration', type: 'issue', details: 'GitHub Issue', tokens: '290 tokens' },
]

const DEFAULT_RULES: AIRule[] = [
  { id: 'r1', text: 'Never modify production files without explicit plan confirmation', enabled: true, category: 'Safety' },
  { id: 'r2', text: 'Prefer TypeScript over plain JavaScript for all components', enabled: true, category: 'Coding Standard' },
  { id: 'r3', text: 'Follow project coding standards & Tailwind CSS v4 design tokens', enabled: true, category: 'Style' },
  { id: 'r4', text: 'Always generate unit tests for newly created module functions', enabled: true, category: 'Testing' },
  { id: 'r5', text: 'Never expose secrets, API keys, or JWT private keys', enabled: true, category: 'Security' },
]

const RAG_SEARCH_RESULTS = [
  {
    filename: 'Backend/main.py',
    score: '98% match',
    snippet: 'app = FastAPI(title="AI Engineering Assistant Engine")',
    source: 'FastAPI Router',
  },
  {
    filename: 'components/app-shell.tsx',
    score: '94% match',
    snippet: 'const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)',
    source: 'React 19 Shell',
  },
  {
    filename: 'lib/auth.ts',
    score: '91% match',
    snippet: 'export async function authenticateUser(token: string)',
    source: 'Auth Module',
  },
]

export function ContextPanelRight({ isOpen, setIsOpen, selectedFile }: ContextPanelRightProps) {
  const [activeTab, setActiveTab] = useState<'context' | 'rag' | 'rules'>('context')

  // Context Tab State
  const [references, setReferences] = useState<ReferenceItem[]>(DEFAULT_REFERENCES)
  const [showAddSymbolModal, setShowAddSymbolModal] = useState(false)
  const [newSymbolName, setNewSymbolName] = useState('')
  const [newSymbolType, setNewSymbolType] = useState<ReferenceItem['type']>('function')

  // Vector RAG Tab State
  const [indexing, setIndexing] = useState(false)
  const [ragStatus, setRagStatus] = useState('● Connected')
  const [lastIndexTime, setLastIndexTime] = useState('5m ago')
  const [ragSearch, setRagSearch] = useState('')

  // Rules Tab State
  const [rules, setRules] = useState<AIRule[]>(DEFAULT_RULES)
  const [showAddRuleModal, setShowAddRuleModal] = useState(false)
  const [newRuleText, setNewRuleText] = useState('')
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [editingRuleText, setEditingRuleText] = useState('')

  // Load & Save Rules in localStorage
  useEffect(() => {
    try {
      const savedRules = localStorage.getItem('copilot_ai_rules')
      if (savedRules) setRules(JSON.parse(savedRules))
    } catch (e) {}
  }, [])

  const saveRules = (newRules: AIRule[]) => {
    setRules(newRules)
    try {
      localStorage.setItem('copilot_ai_rules', JSON.stringify(newRules))
    } catch (e) {}
  }

  if (!isOpen) return null

  const handleAddSymbol = () => {
    if (!newSymbolName.trim()) return
    const newItem: ReferenceItem = {
      id: `ref-${Date.now()}`,
      name: newSymbolName.trim(),
      type: newSymbolType,
      details: 'Active Context',
      tokens: '300 tokens',
    }
    setReferences((prev) => [newItem, ...prev])
    setNewSymbolName('')
    setShowAddSymbolModal(false)
  }

  const handleRemoveReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id))
  }

  const handleReindex = () => {
    setIndexing(true)
    setTimeout(() => {
      setIndexing(false)
      setLastIndexTime('Just now')
      setRagStatus('● Connected & Synced')
    }, 1200)
  }

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    saveRules(updated)
  }

  const handleAddRule = () => {
    if (!newRuleText.trim()) return
    const newR: AIRule = {
      id: `rule-${Date.now()}`,
      text: newRuleText.trim(),
      enabled: true,
      category: 'Custom Rule',
    }
    saveRules([newR, ...rules])
    setNewRuleText('')
    setShowAddRuleModal(false)
  }

  const handleDeleteRule = (id: string) => {
    saveRules(rules.filter((r) => r.id !== id))
  }

  const getTypeIcon = (t: ReferenceItem['type']) => {
    switch (t) {
      case 'file': return <FileCode className="size-3.5 text-blue-400 shrink-0" />
      case 'function': return <Code className="size-3.5 text-emerald-400 shrink-0" />
      case 'class': return <Hash className="size-3.5 text-purple-400 shrink-0" />
      case 'repo': return <FolderGit2 className="size-3.5 text-amber-400 shrink-0" />
      case 'pr': return <GitPullRequest className="size-3.5 text-purple-300 shrink-0" />
      case 'issue': return <AlertCircle className="size-3.5 text-amber-300 shrink-0" />
    }
  }

  const filteredRagResults = RAG_SEARCH_RESULTS.filter(
    (r) =>
      r.filename.toLowerCase().includes(ragSearch.toLowerCase()) ||
      r.snippet.toLowerCase().includes(ragSearch.toLowerCase())
  )

  return (
    <aside className="w-80 h-full shrink-0 border-l border-white/[0.08] bg-[#0c0c0e] flex flex-col justify-between text-xs z-20 select-none">
      {/* Header */}
      <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Sparkles className="size-3" />
          </div>
          <span className="font-semibold text-zinc-200 tracking-tight text-xs">Context & Memory</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-white/[0.06] transition-colors"
          title="Collapse Context Panel (⌘I)"
        >
          <PanelRightClose className="size-4" />
        </button>
      </div>

      {/* Segmented Control Tabs */}
      <div className="p-2 border-b border-white/[0.06] bg-zinc-950/40">
        <div className="grid grid-cols-3 gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('context')}
            className={`py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'context'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Context
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'rag'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Vector RAG
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'rules'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Rules ({rules.filter((r) => r.enabled).length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
        {/* ================= 1. CONTEXT TAB ================= */}
        {activeTab === 'context' && (
          <>
            {/* Selected Focus File */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
              <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider flex items-center justify-between font-mono">
                <span>Selected Focus File</span>
                <span className="size-2 rounded-full bg-blue-400 animate-ping" />
              </div>
              <div className="font-mono text-xs text-white font-semibold truncate">
                {selectedFile || 'app/page.tsx'}
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1 border-t border-blue-500/15">
                <span>Language: TypeScript</span>
                <span>L1 - L45</span>
                <span className="text-blue-300">1,240 tokens</span>
              </div>
            </div>

            {/* Active References */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <span>Active References ({references.length})</span>
                <button
                  onClick={() => setShowAddSymbolModal(true)}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px] font-normal"
                >
                  <Plus className="size-3" /> Add Symbol
                </button>
              </div>

              {/* Add Symbol Input Popup */}
              {showAddSymbolModal && (
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 text-[11px]">Add Reference Symbol</span>
                    <button onClick={() => setShowAddSymbolModal(false)} className="text-zinc-500 hover:text-white">✕</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Symbol name or file path..."
                    value={newSymbolName}
                    onChange={(e) => setNewSymbolName(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={newSymbolType}
                      onChange={(e) => setNewSymbolType(e.target.value as any)}
                      className="bg-zinc-950 text-zinc-300 border border-white/10 rounded px-2 py-1 text-[10px]"
                    >
                      <option value="function">Function</option>
                      <option value="class">Class</option>
                      <option value="file">File</option>
                      <option value="repo">Repository</option>
                      <option value="pr">Pull Request</option>
                      <option value="issue">Issue</option>
                    </select>
                    <button
                      onClick={handleAddSymbol}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {references.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-zinc-900/60 border border-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getTypeIcon(item.type)}
                      <div className="truncate">
                        <div className="font-mono text-[11px] text-zinc-200 truncate">{item.name}</div>
                        <div className="text-[9px] text-zinc-500">{item.details}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                        {item.tokens}
                      </span>
                      <button
                        onClick={() => handleRemoveReference(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-red-400 transition-opacity"
                        title="Remove Reference"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= 2. VECTOR RAG TAB ================= */}
        {activeTab === 'rag' && (
          <div className="space-y-3">
            {/* Vector DB Telemetry Status */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <Database className="size-3.5 text-emerald-400" /> Vector DB Status
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
                  {ragStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-emerald-200/90 border-t border-emerald-500/15 pt-2">
                <div>Files: 142 Indexed</div>
                <div>Model: text-embedding-3-large</div>
                <div>Dimension: 3072d</div>
                <div>Updated: {lastIndexTime}</div>
              </div>
            </div>

            {/* RAG Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReindex}
                disabled={indexing}
                className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`size-3 text-emerald-400 ${indexing ? 'animate-spin' : ''}`} />
                <span>{indexing ? 'Indexing...' : 'Re-index Repo'}</span>
              </button>

              <button
                onClick={() => alert('Index cleared.')}
                className="py-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors"
              >
                Clear Index
              </button>
            </div>

            {/* Knowledge Base Search */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Search Knowledge Base
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search vector embeddings..."
                  value={ragSearch}
                  onChange={(e) => setRagSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2 pt-1">
                {filteredRagResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] hover:border-blue-500/30 transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-semibold text-zinc-200 truncate">{res.filename}</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                        {res.score}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono truncate">{res.snippet}</p>
                    <div className="text-[9px] text-zinc-500">{res.source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. RULES TAB ================= */}
        {activeTab === 'rules' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              <span>AI Guidelines & Rules ({rules.length})</span>
              <button
                onClick={() => setShowAddRuleModal(true)}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px] font-normal"
              >
                <Plus className="size-3" /> Add Rule
              </button>
            </div>

            {/* Add Rule Modal */}
            {showAddRuleModal && (
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 text-[11px]">Create AI Guideline</span>
                  <button onClick={() => setShowAddRuleModal(false)} className="text-zinc-500 hover:text-white">✕</button>
                </div>
                <input
                  type="text"
                  placeholder="Rule instruction (e.g. Always generate tests)..."
                  value={newRuleText}
                  onChange={(e) => setNewRuleText(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddRule}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            )}

            {/* Rules List */}
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-2.5 rounded-xl border transition-all space-y-2 group ${
                    rule.enabled
                      ? 'bg-zinc-900/80 border-white/10 text-zinc-200'
                      : 'bg-zinc-950/40 border-white/[0.04] text-zinc-500 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs leading-relaxed font-medium">{rule.text}</p>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        rule.enabled ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-600 bg-zinc-800'
                      }`}
                      title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
                    >
                      {rule.enabled && <Check className="size-3 font-bold" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-1 border-t border-white/[0.04]">
                    <span className="bg-zinc-800 px-1.5 py-0.2 rounded text-zinc-400">{rule.category}</span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Token Gauge Bar */}
      <div className="p-3 border-t border-white/[0.06] bg-zinc-950/80 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 font-medium flex items-center gap-1.5">
            <Cpu className="size-3 text-blue-400" /> Context Window
          </span>
          <span className="font-mono text-zinc-200 text-[10px]">42.5k / 200k tokens</span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full w-[21%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>21% used</span>
          <span>Latency: 140ms</span>
        </div>
      </div>
    </aside>
  )
}
