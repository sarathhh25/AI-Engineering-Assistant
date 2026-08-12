'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Terminal as TerminalIcon,
  ChevronDown,
  Trash2,
  Filter,
  Search,
  Cpu,
  HardDrive,
  Coins,
  Activity,
  Zap,
  Bot,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface LogEntry {
  id: string
  time: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'
  msg: string
}

const INITIAL_LOGS: LogEntry[] = [
  { id: 'l1', time: '15:50:12', level: 'INFO', msg: 'Antigravity AI Agent session initialized [Session ID: #ae-9481]' },
  { id: 'l2', time: '15:50:14', level: 'SUCCESS', msg: 'Loaded vector embeddings for 142 workspace files (text-embedding-3-large)' },
  { id: 'l3', time: '15:50:18', level: 'INFO', msg: 'Connected to local FastAPI engine at http-[#127.0.0.1:8000]' },
  { id: 'l4', time: '15:50:25', level: 'WARN', msg: 'Sub-optimal query pattern detected in Backend/main.py:L14' },
  { id: 'l5', time: '15:50:37', level: 'SUCCESS', msg: 'App Shell layout updated successfully (Tailwind CSS + Next.js 16)' },
  { id: 'l6', time: '15:51:02', level: 'INFO', msg: 'Synchronized local storage state for 9 active integrations' },
  { id: 'l7', time: '15:51:40', level: 'ERROR', msg: 'Connection timeout on legacy CORS proxy - retried via localhost' },
]

const MOCK_COMMAND_OUTPUTS: Record<string, string> = {
  'npm install': `added 142 packages, and audited 143 packages in 2s\n\n14 packages are looking for funding\n  run \`npm fund\` for details\n\nfound 0 vulnerabilities`,
  'npm run dev': `> my-project@0.1.0 dev\n> next dev\n\n▲ Next.js 16.2.12 (Turbopack)\n  - Local:        http://localhost:3000\n  - Environments: .env.local\n\n✓ Ready in 1.4s`,
  'npm test': `PASS  tests/auth.test.ts\n  Auth Module\n    ✓ validates session JWT signatures (12 ms)\n    ✓ handles expired refresh tokens (8 ms)\n\nTest Suites: 1 passed, 1 total\nTests:       2 passed, 2 total\nSnapshots:   0 total\nTime:        0.824 s`,
  'npm run build': `> my-project@0.1.0 build\n> next build\n\n▲ Next.js 16.2.12 (Turbopack)\n✓ Compiled successfully in 3.4s\n  Collecting page data using 4 workers ...\n✓ Generating static pages (3/3) in 650ms`,
  'git status': `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\tmodified:   app/page.tsx\n\tmodified:   components/app-shell.tsx\n\nno changes added to commit`,
  'git log': `commit 7f8b9a2d8e41f (HEAD -> main, origin/main)\nAuthor: Sarath <sarath@sunka.ai>\nDate:   Sat Aug 8 16:30:00 2026 +0530\n\n    feat: add integrations center and modular top-nav`,
  'git branch': `* main\n  develop\n  feature/app-shell`,
  'python --version': `Python 3.11.4`,
}

interface DeveloperTerminalProps {
  isOpen: boolean
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

export function DeveloperTerminal({ isOpen, setIsOpen }: DeveloperTerminalProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'logs' | 'metrics'>('terminal')
  const [expanded, setExpanded] = useState(false)

  // Terminal State
  const [commandInput, setCommandInput] = useState('')
  const [history, setHistory] = useState<{ command: string; output: string }[]>([
    { command: 'npm run dev', output: MOCK_COMMAND_OUTPUTS['npm run dev'] },
  ])
  const terminalEndRef = useRef<HTMLDivElement>(null)

  // Logs State
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL')
  const [logSearch, setLogSearch] = useState('')

  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history, activeTab])

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commandInput.trim()) return

    const cmd = commandInput.trim()
    const output = MOCK_COMMAND_OUTPUTS[cmd.toLowerCase()] || `bash: command not found: ${cmd}. Try 'npm test', 'git status', or 'python --version'.`

    setHistory((prev) => [...prev, { command: cmd, output }])
    setCommandInput('')
  }

  const filteredLogs = logs.filter((log) => {
    if (logFilter !== 'ALL' && log.level !== logFilter) return false
    if (logSearch && !log.msg.toLowerCase().includes(logSearch.toLowerCase())) return false
    return true
  })

  return (
    <div
      className={`w-full border-t border-white/[0.08] bg-[#0c0c0e] shrink-0 transition-[height] duration-200 overflow-hidden font-mono text-xs select-none flex flex-col ${
        !isOpen ? 'h-8' : expanded ? 'h-72' : 'h-48'
      }`}
    >
      {/* Drawer Header Bar */}
      <div className="h-8 px-3 bg-zinc-950/90 flex items-center justify-between border-b border-white/[0.06] text-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 text-zinc-300 font-medium hover:text-white"
          >
            <TerminalIcon className="size-3.5 text-blue-400" />
            <span>Agent Output & Developer Terminal</span>
            <ChevronDown className={`size-3 text-zinc-400 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
          </button>

          <div className="h-3 w-px bg-white/10" />

          {/* Console Tabs */}
          <div className="flex items-center gap-1 text-[11px]">
            {[
              { id: 'terminal', label: 'Terminal' },
              { id: 'logs', label: `Logs (${logs.length})` },
              { id: 'metrics', label: 'Metrics' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id as any)
                  setIsOpen(true)
                }}
                className={`px-2.5 py-0.5 rounded capitalize transition-all ${
                  activeTab === t.id && isOpen
                    ? 'bg-zinc-800 text-white font-medium shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Header Status & Height Resize Toggle */}
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> Engine Connected
          </span>

          {isOpen && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title={expanded ? 'Minimize Terminal Height' : 'Expand Terminal Height'}
            >
              {expanded ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Drawer Body Content */}
      {isOpen && (
        <div className="flex-1 overflow-hidden bg-[#08080a] text-zinc-200">
          {/* ================= 1. TERMINAL TAB ================= */}
          {activeTab === 'terminal' && (
            <div className="h-full flex flex-col justify-between p-3">
              <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px] leading-relaxed no-scrollbar">
                {history.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-blue-400 font-bold">sarath@antigravity-copilot:~$</span>
                      <span>{item.command}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-zinc-400 pl-4 border-l border-white/5">
                      {item.output}
                    </div>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal Command Input Form */}
              <form onSubmit={handleCommandSubmit} className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
                <span className="text-blue-400 font-bold text-[11px]">sarath@antigravity-copilot:~$</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Type mock command (npm test, git status, npm run build)..."
                  className="flex-1 bg-transparent text-xs text-white outline-none font-mono placeholder-zinc-600"
                />
              </form>
            </div>
          )}

          {/* ================= 2. LOGS TAB ================= */}
          {activeTab === 'logs' && (
            <div className="h-full flex flex-col justify-between p-3 space-y-2">
              {/* Log Controls */}
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 size-3 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="bg-zinc-900 border border-white/10 rounded pl-7 pr-2 py-0.5 text-[11px] text-white outline-none w-44"
                    />
                  </div>

                  <select
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value as any)}
                    className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-[11px] text-zinc-300 outline-none"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                    <option value="SUCCESS">SUCCESS</option>
                  </select>
                </div>

                <button
                  onClick={() => setLogs([])}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors"
                >
                  <Trash2 className="size-3" />
                  <span>Clear Logs</span>
                </button>
              </div>

              {/* Log Entries */}
              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 italic">No logs matching filter.</div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-tight">
                      <span className="text-zinc-600 shrink-0">{log.time}</span>
                      <span
                        className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                          log.level === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : log.level === 'WARN'
                            ? 'bg-amber-500/20 text-amber-300'
                            : log.level === 'ERROR'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-zinc-300 truncate">{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= 3. METRICS TAB ================= */}
          {activeTab === 'metrics' && (
            <div className="h-full p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <Cpu className="size-3.5 text-blue-400" /> CPU Load
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">1.4%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full w-[14%] bg-blue-500 rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <HardDrive className="size-3.5 text-purple-400" /> RAM Memory
                  </span>
                  <span className="text-zinc-200 font-mono">142 MB / 16 GB</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full w-[12%] bg-purple-500 rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <Coins className="size-3.5 text-amber-400" /> Token Usage
                  </span>
                  <span className="text-amber-300 font-mono font-semibold">42.5k / 200k</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full w-[21%] bg-amber-500 rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <Activity className="size-3.5 text-emerald-400" /> Latency
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">140 ms</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">Sub-200ms vector search</div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <Zap className="size-3.5 text-sky-400" /> Requests Today
                  </span>
                  <span className="text-zinc-200 font-mono font-bold">124 reqs</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">100% success rate</div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <Bot className="size-3.5 text-pink-400" /> Agent Executions
                  </span>
                  <span className="text-purple-300 font-mono font-bold">46 runs</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">8 active agents</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
