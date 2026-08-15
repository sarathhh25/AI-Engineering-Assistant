'use client'

import React, { useState, useEffect } from 'react'
import { SettingsNav, SettingsSection } from './settings-nav'
import {
  Sliders,
  Palette,
  Cpu,
  MessageSquare,
  GitBranch,
  Bell,
  ShieldCheck,
  User,
  Check,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react'

export interface CopilotSettings {
  language: string
  timezone: string
  startupPage: string
  themeMode: 'dark' | 'light' | 'system'
  compactMode: boolean
  defaultModel: string
  temperature: number
  maxTokens: number
  responseStyle: 'Concise' | 'Detailed' | 'Code-only'
  saveChatHistory: boolean
  autoScroll: boolean
  showTimestamps: boolean
  codeWrapping: boolean
  defaultRepo: string
  defaultBranch: string
  autoIndexing: boolean
  agentCompletionNotify: boolean
  repoEventsNotify: boolean
  prEventsNotify: boolean
  errorAlertsNotify: boolean
  telemetryEnabled: boolean
  dataRetention: string
  profileName: string
  profileRole: string
  avatarInitials: string
}

const DEFAULT_SETTINGS: CopilotSettings = {
  language: 'English (US)',
  timezone: 'UTC +5:30 (India Standard Time)',
  startupPage: 'Dashboard Center',
  themeMode: 'dark',
  compactMode: false,
  defaultModel: 'claude-3-7-sonnet',
  temperature: 0.2,
  maxTokens: 4096,
  responseStyle: 'Detailed',
  saveChatHistory: true,
  autoScroll: true,
  showTimestamps: true,
  codeWrapping: true,
  defaultRepo: 'ai-engineering-assistant',
  defaultBranch: 'main',
  autoIndexing: true,
  agentCompletionNotify: true,
  repoEventsNotify: true,
  prEventsNotify: true,
  errorAlertsNotify: true,
  telemetryEnabled: false,
  dataRetention: 'Forever',
  profileName: 'Sunka AI',
  profileRole: 'AI Engineer',
  avatarInitials: 'SK',
}

interface SettingsPageProps {
  initialSection?: SettingsSection
}

export function SettingsPage({ initialSection = 'general' }: SettingsPageProps) {
  const [section, setSection] = useState<SettingsSection>(initialSection)
  const [settings, setSettings] = useState<CopilotSettings>(DEFAULT_SETTINGS)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('copilot_settings_v1')
      if (saved) {
        setSettings(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const saveSettings = (newSettings: CopilotSettings) => {
    setSettings(newSettings)
    try {
      localStorage.setItem('copilot_settings_v1', JSON.stringify(newSettings))
      setToastMsg('Settings saved successfully.')
      setTimeout(() => setToastMsg(null), 2000)
    } catch {}
  }

  const updateSetting = <K extends keyof CopilotSettings>(key: K, value: CopilotSettings[K]) => {
    const updated = { ...settings, [key]: value }
    saveSettings(updated)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 select-none antialiased">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sliders className="size-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Settings & Personalization
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure system parameters, LLM model defaults, UI preferences, and developer profile.
          </p>
        </div>

        {toastMsg && (
          <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="size-3.5" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Main Settings 2-Pane Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        <SettingsNav activeSection={section} onSelectSection={setSection} />

        {/* Section Content Pane */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-6 space-y-6 text-xs shadow-xs">
          {/* ================= 1. GENERAL ================= */}
          {section === 'general' && (
            <div className="space-y-4 font-mono">
              <h2 className="text-sm font-bold text-foreground font-sans border-b border-border pb-2">
                General System Settings
              </h2>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl p-2.5 text-foreground outline-none cursor-pointer"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="German">German (Deutsch)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl p-2.5 text-foreground outline-none cursor-pointer"
                >
                  <option value="UTC +5:30 (India Standard Time)">UTC +5:30 (India Standard Time)</option>
                  <option value="UTC +0:00 (GMT)">UTC +0:00 (GMT)</option>
                  <option value="UTC -5:00 (Eastern Time)">UTC -5:00 (Eastern Time)</option>
                  <option value="UTC -8:00 (Pacific Time)">UTC -8:00 (Pacific Time)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Default Startup Page</label>
                <select
                  value={settings.startupPage}
                  onChange={(e) => updateSetting('startupPage', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl p-2.5 text-foreground outline-none cursor-pointer"
                >
                  <option value="Dashboard Center">Dashboard Center</option>
                  <option value="AI Chat Workspace">AI Chat Workspace</option>
                  <option value="Repository Explorer">Repository Explorer</option>
                  <option value="Integrations Center">Integrations Center</option>
                </select>
              </div>
            </div>
          )}

          {/* ================= 2. APPEARANCE ================= */}
          {section === 'appearance' && (
            <div className="space-y-4 font-mono">
              <h2 className="text-sm font-bold text-foreground font-sans border-b border-border pb-2">
                Appearance & Theme
              </h2>

              <div className="space-y-2">
                <label className="text-muted-foreground font-semibold">Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'system'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSetting('themeMode', mode)}
                      className={`p-3 rounded-xl border capitalize text-center font-medium transition-all cursor-pointer ${
                        settings.themeMode === mode
                          ? 'bg-primary/15 border-primary/40 text-primary font-bold shadow-xs'
                          : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {mode} mode
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border pt-3">
                <div>
                  <div className="font-semibold text-foreground">Compact Density Mode</div>
                  <div className="text-[10px] text-muted-foreground">Reduce padding and font sizes for high-density monitors</div>
                </div>
                <button
                  onClick={() => updateSetting('compactMode', !settings.compactMode)}
                  className={`size-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                    settings.compactMode ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-secondary'
                  }`}
                >
                  {settings.compactMode && <Check className="size-3 font-bold" />}
                </button>
              </div>
            </div>
          )}

          {/* ================= 3. AI ENGINE ================= */}
          {section === 'ai' && (
            <div className="space-y-4 font-mono">
              <h2 className="text-sm font-bold text-foreground font-sans border-b border-border pb-2">
                AI Engine & LLM Defaults
              </h2>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Default Primary Model</label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) => updateSetting('defaultModel', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl p-2.5 text-foreground outline-none cursor-pointer"
                >
                  <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Anthropic - Recommended)</option>
                  <option value="gpt-4-1">GPT-4.1 (OpenAI)</option>
                  <option value="gemini-2-5-pro">Gemini 2.5 Pro (Google)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground font-semibold">
                  <span>Temperature ({settings.temperature})</span>
                  <span className="text-[10px] text-muted-foreground">0.0 (Precise) to 1.0 (Creative)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                  className="w-full text-primary accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground font-semibold">
                  <span>Maximum Response Tokens ({settings.maxTokens.toLocaleString()})</span>
                  <span className="text-[10px] text-muted-foreground">1,024 to 32,768</span>
                </div>
                <input
                  type="range"
                  min="1024"
                  max="32768"
                  step="1024"
                  value={settings.maxTokens}
                  onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                  className="w-full text-primary accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">AI Response Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Concise', 'Detailed', 'Code-only'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateSetting('responseStyle', style)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        settings.responseStyle === style
                          ? 'bg-primary/15 border-primary/40 text-primary font-bold shadow-xs'
                          : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. CHAT & EDITOR ================= */}
          {section === 'chat' && (
            <div className="space-y-3 font-mono">
              <h2 className="text-sm font-bold text-foreground font-sans border-b border-border pb-2">
                Chat & Editor Preferences
              </h2>

              {[
                { key: 'saveChatHistory', title: 'Save Local Chat History', desc: 'Persist sessions to browser localStorage' },
                { key: 'autoScroll', title: 'Auto-Scroll Messages', desc: 'Automatically scroll to latest AI responses' },
                { key: 'showTimestamps', title: 'Show Message Timestamps', desc: 'Display time markers on user and assistant bubbles' },
                { key: 'codeWrapping', title: 'Code Block Soft Wrapping', desc: 'Wrap long code lines without horizontal scrolling' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                  <div>
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => updateSetting(item.key as any, !settings[item.key as keyof CopilotSettings])}
                    className={`size-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                      settings[item.key as keyof CopilotSettings]
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border bg-secondary'
                    }`}
                  >
                    {settings[item.key as keyof CopilotSettings] && <Check className="size-3 font-bold" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ================= 5. REPOSITORY ================= */}
          {section === 'repository' && (
            <div className="space-y-4 font-mono">
              <h2 className="text-sm font-bold text-foreground font-sans border-b border-border pb-2">
                Default Repository Settings
              </h2>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Primary Repository</label>
                <select
                  value={settings.defaultRepo}
                  onChange={(e) => updateSetting('defaultRepo', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl p-2.5 text-foreground outline-none cursor-pointer"
                >
                  <option value="ai-engineering-assistant">ai-engineering-assistant</option>
                  <option value="Google_maps">Google_maps</option>
                  <option value="CuriousBees">CuriousBees</option>
                  <option value="Financial-Tracker">Financial-Tracker</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Default Branch</label>
                <select
                  value={settings.defaultBranch}
                  onChange={(e) => updateSetting('defaultBranch', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl p-2.5 text-foreground outline-none cursor-pointer"
                >
                  <option value="main">main</option>
                  <option value="develop">develop</option>
                  <option value="staging">staging</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                <div>
                  <div className="font-semibold text-foreground">Automatic Vector Indexing</div>
                  <div className="text-[10px] text-muted-foreground">Re-index vector database on git commits</div>
                </div>
                <button
                  onClick={() => updateSetting('autoIndexing', !settings.autoIndexing)}
                  className={`size-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                    settings.autoIndexing ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-secondary'
                  }`}
                >
                  {settings.autoIndexing && <Check className="size-3 font-bold" />}
                </button>
              </div>
            </div>
          )}

          {/* ================= 6. NOTIFICATIONS ================= */}
          {section === 'notifications' && (
            <div className="space-y-3 font-mono">
              <h2 className="text-sm font-bold text-foreground font-sans border-b border-border pb-2">
                Notification Alerts
              </h2>

              {[
                { key: 'agentCompletionNotify', title: 'Agent Task Completion', desc: 'Notify when autonomous agents finish executions' },
                { key: 'repoEventsNotify', title: 'Repository Commit Events', desc: 'Alert when commits or branches push to target repo' },
                { key: 'prEventsNotify', title: 'Pull Request Events', desc: 'Notify when PR reviews or comments are posted' },
                { key: 'errorAlertsNotify', title: 'Runtime Error Alerts', desc: 'Notify on critical system errors or build failures' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                  <div>
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => updateSetting(item.key as any, !settings[item.key as keyof CopilotSettings])}
                    className={`size-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                      settings[item.key as keyof CopilotSettings]
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border bg-secondary'
                    }`}
                  >
                    {settings[item.key as keyof CopilotSettings] && <Check className="size-3 font-bold" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ================= 7. PRIVACY & SECURITY ================= */}
          {section === 'privacy' && (
            <div className="space-y-4 font-mono">
              <h2 className="text-sm font-bold text-foreground font-sans border-b border-border pb-2">
                Privacy & Data Security
              </h2>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                <div>
                  <div className="font-semibold text-foreground">Anonymous Telemetry</div>
                  <div className="text-[10px] text-muted-foreground">Send anonymous performance data to improve model routing</div>
                </div>
                <button
                  onClick={() => updateSetting('telemetryEnabled', !settings.telemetryEnabled)}
                  className={`size-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                    settings.telemetryEnabled ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-secondary'
                  }`}
                >
                  {settings.telemetryEnabled && <Check className="size-3 font-bold" />}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Data Retention Policy</label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting('dataRetention', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl p-2.5 text-foreground outline-none cursor-pointer"
                >
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days">90 Days</option>
                  <option value="Forever">Forever (Local Only)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('copilot_chats')
                    alert('Local chat history cleared successfully.')
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold transition-colors cursor-pointer"
                >
                  Clear Local Chat History
                </button>
              </div>
            </div>
          )}

          {/* ================= 8. PERSONALIZATION ================= */}
          {section === 'personalization' && (
            <div className="space-y-4 font-mono">
              <h2 className="text-sm font-bold text-foreground font-sans border-b border-border pb-2">
                Developer Profile & Personalization
              </h2>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="size-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shrink-0">
                  <div className="size-full rounded-full bg-card flex items-center justify-center font-bold text-foreground text-base">
                    {settings.avatarInitials}
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <input
                    type="text"
                    value={settings.profileName}
                    onChange={(e) => updateSetting('profileName', e.target.value)}
                    className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-bold outline-none w-full focus:border-primary/50"
                    placeholder="Profile Name"
                  />
                  <input
                    type="text"
                    value={settings.profileRole}
                    onChange={(e) => updateSetting('profileRole', e.target.value)}
                    className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 outline-none w-full font-mono focus:border-primary/50"
                    placeholder="Developer Role"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
