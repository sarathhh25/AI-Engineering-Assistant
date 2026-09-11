'use client'

import React from 'react'
import { Coins, Cpu, Zap, Gauge, Flame } from 'lucide-react'

export function AIUsageCard() {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Coins className="size-3.5" />
          </div>
          <h2 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
            AI Credits & Usage
          </h2>
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-bold">
          PRO Plan
        </span>
      </div>

      {/* Credit Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px]">Monthly Credits</span>
          <span className="font-mono text-amber-300 font-bold text-[11px]">8,450 / 10,000</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full w-[84.5%] bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full" />
        </div>
      </div>

      {/* Model Usage Distribution */}
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Model Distribution
        </div>

        <div className="space-y-1.5">
          {[
            { model: 'Claude (Anthropic)', percent: 45, color: 'bg-indigo-500' },
            { model: 'GPT (OpenAI)', percent: 30, color: 'bg-emerald-500' },
            { model: 'Gemini (Google)', percent: 25, color: 'bg-blue-500' },
          ].map((m) => (
            <div key={m.model} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300">{m.model}</span>
                <span className="font-mono text-zinc-400 text-[10px]">{m.percent}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center font-mono">
        <div className="p-2 rounded bg-zinc-950/60 border border-white/[0.04]">
          <div className="text-[10px] text-zinc-500">Requests</div>
          <div className="text-sm font-bold text-zinc-200">124</div>
        </div>
        <div className="p-2 rounded bg-zinc-950/60 border border-white/[0.04]">
          <div className="text-[10px] text-zinc-500">Tokens</div>
          <div className="text-sm font-bold text-blue-400">1.8M</div>
        </div>
        <div className="p-2 rounded bg-zinc-950/60 border border-white/[0.04]">
          <div className="text-[10px] text-zinc-500">Avg Latency</div>
          <div className="text-sm font-bold text-emerald-400">1.4s</div>
        </div>
      </div>
    </div>
  )
}
