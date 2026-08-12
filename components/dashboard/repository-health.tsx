'use client'

import React from 'react'
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react'

export function RepositoryHealth() {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="size-3.5" />
          </div>
          <h2 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
            Repository Health
          </h2>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          92 / 100
        </div>
      </div>

      {/* Visual Health Score Indicator */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-950/60 border border-white/[0.04]">
        {/* Simple Ring Gauge representation */}
        <div className="relative size-12 shrink-0 flex items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-zinc-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-400"
              strokeDasharray="92, 100"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute font-mono text-[11px] font-bold text-white">92%</span>
        </div>

        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-zinc-100">Overall Health Score</div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            High quality score across build pipelines, test coverage, and security audits.
          </p>
        </div>
      </div>

      {/* Health Metric Rows */}
      <div className="space-y-1.5 text-xs">
        {[
          { label: 'Build Status', status: 'Passing', isOk: true },
          { label: 'Tests', status: '94% coverage', isOk: true },
          { label: 'Dependencies', status: '3 outdated', isOk: false },
          { label: 'Security', status: 'No critical issues', isOk: true },
          { label: 'Code Quality', status: 'Excellent', isOk: true },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-2 rounded bg-zinc-950/40 border border-white/[0.04]"
          >
            <span className="text-zinc-400 text-[11px]">{item.label}</span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-medium">
              <span
                className={`size-1.5 rounded-full ${
                  item.isOk ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className={item.isOk ? 'text-zinc-200' : 'text-amber-300'}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
