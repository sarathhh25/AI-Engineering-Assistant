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
    <div className="p-5 rounded-2xl bg-card border border-border space-y-4 select-none font-mono text-xs shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="font-semibold text-sm text-foreground font-sans">{agentName} Execution Workflow</h3>
          <p className="text-[10px] text-muted-foreground">Autonomous Execution Pipeline</p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold">
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
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? 'bg-primary/15 border-primary/40 text-primary animate-pulse'
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  isDone
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step Log Snippet Container */}
      <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Live Telemetry Log</div>
        <div className="text-[11px] text-foreground leading-relaxed font-mono">
          {steps[currentStepIndex]?.logSnippet || 'Initializing agent workspace vectors...'}
        </div>
      </div>
    </div>
  )
}
