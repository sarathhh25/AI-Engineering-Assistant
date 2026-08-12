'use client'

import React from 'react'
import { CheckCircle2, Loader2, Circle, ArrowRight } from 'lucide-react'

export type StepState = 'pending' | 'running' | 'completed'

export interface WorkflowStep {
  id: string
  label: string
  status: StepState
  logSnippet?: string
}

interface AgentExecutionProps {
  agentName: string
  currentStepIndex: number
  steps: WorkflowStep[]
}

export function AgentExecution({ agentName, currentStepIndex, steps }: AgentExecutionProps) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-4 select-none font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div>
          <h3 className="font-semibold text-sm text-zinc-100 font-sans">{agentName} Execution Workflow</h3>
          <p className="text-[10px] text-zinc-400">Autonomous Execution Pipeline</p>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold">
          <Loader2 className="size-3 animate-spin" />
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
        </div>
      </div>

      {/* Visual Workflow Steps Bar */}
      <div className="grid grid-cols-5 gap-2 text-center py-2">
        {steps.map((step, idx) => {
          const isDone = step.status === 'completed'
          const isCurrent = step.status === 'running'

          return (
            <div key={step.id} className="flex flex-col items-center space-y-1.5">
              <div
                className={`size-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : isCurrent
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 animate-pulse'
                    : 'bg-zinc-950 border-white/10 text-zinc-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="size-4 animate-spin text-blue-400" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  isDone
                    ? 'text-emerald-400'
                    : isCurrent
                    ? 'text-blue-300 font-bold'
                    : 'text-zinc-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step Log Snippet Container */}
      <div className="p-3 rounded-lg bg-[#08080a] border border-white/[0.06] space-y-1">
        <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Live Telemetry Log</div>
        <div className="text-[11px] text-zinc-300 leading-relaxed font-mono">
          {steps[currentStepIndex]?.logSnippet || 'Initializing agent workspace vectors...'}
        </div>
      </div>
    </div>
  )
}
