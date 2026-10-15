/**
 * Centralized API Client for AI Engineering Copilot.
 * Connects Next.js Frontend to FastAPI Backend (http://127.0.0.1:8000).
 * Supports timeouts, retries, error handling, and graceful offline fallback.
 */

export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const hostname = window.location.hostname
    const protocol = window.location.protocol || 'http:'
    const envUrl = process.env.NEXT_PUBLIC_API_URL
    if (envUrl && !envUrl.includes('10.144.212.47')) {
      if ((hostname === 'localhost' || hostname === '127.0.0.1') && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl.replace(/\/$/, '')
      }
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `${protocol}//${hostname}:8000`
      }
      return envUrl.replace(/\/$/, '')
    }
    return `${protocol}//${hostname}:8000`
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (envUrl && !envUrl.includes('10.144.212.47')) {
    return envUrl.replace(/\/$/, '')
  }
  return 'http://127.0.0.1:8000'
}

const API_BASE_URL = resolveApiBaseUrl()

interface FetchOptions extends RequestInit {
  timeoutMs?: number
  retries?: number
}

export interface GitHubRepoDetails {
  name: string
  owner: string
  branch: string
  language: string
  stars: number
  commits_count: number
  open_issues_count: number
  open_prs_count: number
  status?: string
}

export interface GitHubIntegrationStatus {
  connected: boolean
  status: 'Connected' | 'Disconnected' | 'Connecting' | 'Error'
  configured?: boolean
  username?: string | null
  avatar_url?: string | null
  selected_repo?: string | null
  scopes?: string[]
  connected_at?: string | null
  message?: string | null
}

export interface GitHubRepositoryItem {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  default_branch: string
  html_url: string
  language: string
  updated_at: string
  stars?: number
  open_issues_count?: number
  permissions?: {
    admin?: boolean
    push?: boolean
    pull?: boolean
  }
}

class ApiClient {
  private baseUrl: string
  private cachedToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null): void {
    this.cachedToken = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user_token', token)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user_token')
      }
    }
  }

  async ensureToken(): Promise<string | null> {
    if (this.cachedToken) return this.cachedToken
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('token') || localStorage.getItem('user_token')
      if (local) {
        this.cachedToken = local
        return local
      }
      try {
        const { getSession } = await import('next-auth/react')
        const session: any = await getSession()
        const sessionToken = session?.backendToken || session?.user?.backendToken
        if (sessionToken) {
          this.setToken(sessionToken)
          return sessionToken
        }
      } catch {
        // NextAuth session lookup fallback
      }
    }
    return null
  }

  private getEffectiveBaseUrl(): string {
    return resolveApiBaseUrl() || this.baseUrl
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { timeoutMs = 10000, retries = 2, ...fetchOptions } = options
    const url = `${this.getEffectiveBaseUrl()}${endpoint}`

    // Automatically resolve backend auth token if not already in headers
    if (typeof window !== 'undefined') {
      const headersObj = (fetchOptions.headers || {}) as Record<string, string>
      if (!headersObj['Authorization']) {
        const token = await this.ensureToken()
        if (token) {
          fetchOptions.headers = {
            ...headersObj,
            'Authorization': `Bearer ${token}`,
          }
        }
      }
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(fetchOptions.headers || {}),
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 401) {
            this.setToken(null)
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
              localStorage.removeItem('user_token')
            }
          }

          let errorDetail = ''
          try {
            const errorJson = await response.json()
            errorDetail = errorJson?.detail || errorJson?.message || errorJson?.error || ''
          } catch {
            // response body was not JSON
          }
          const message = errorDetail || `HTTP ${response.status}: ${response.statusText}`
          const errObj: any = new Error(message)
          errObj.status = response.status
          errObj.detail = errorDetail

          // Do not retry 4xx client errors
          if (response.status >= 400 && response.status < 500) {
            throw errObj
          }
          throw errObj
        }

        const data = await response.json()
        return data as T
      } catch (err: any) {
        clearTimeout(timeoutId)
        lastError = err

        // Immediately propagate 4xx client errors
        if (err.status && err.status >= 400 && err.status < 500) {
          throw err
        }

        if (err.name === 'AbortError') {
          lastError = new Error(`Request timed out after ${timeoutMs}ms`)
        }

        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, 500 * (attempt + 1)))
        }
      }
    }

    throw lastError || new Error('Network request failed')
  }

  async checkHealth(): Promise<{ status: string; service: string; version: string }> {
    try {
      return await this.request('/api/health', { method: 'GET', timeoutMs: 3000, retries: 1 })
    } catch (e) {
      return { status: 'offline', service: 'FastAPI (Fallback)', version: '1.0.0' }
    }
  }

  async sendChatMessage(
    message: string,
    repo?: string,
    files: Array<{ fileName: string; content: string }> = [],
    conversationId?: string
  ): Promise<{ reply: string; status?: string; scope?: string; references?: string[]; conversation_id?: string }> {
    try {
      return await this.request('/api/chat', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ message, repo: repo || undefined, files, conversation_id: conversationId }),
        timeoutMs: 40000,
        retries: 1,
      })
    } catch (e: any) {
      return {
        reply: `⚠️ Connection Error: Unable to complete request with the backend server (${e.message || 'Request failed'}). Make sure the backend service is running on port 8000.`,
        status: 'error',
        references: [],
      }
    }
  }

  async fetchGitHubRepo(repo?: string): Promise<GitHubRepoDetails> {
    return await this.request('/api/github/repository', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ repo: repo || undefined }),
      timeoutMs: 15000,
    })
  }

  async fetchGitHubBranches(repo?: string): Promise<string[]> {
    const res = await this.request<{ branches: string[] }>('/api/github/branches', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ repo: repo || undefined }),
      timeoutMs: 15000,
    })
    return res.branches || []
  }

  async executeAgent(
    agentId: string,
    prompt?: string,
    repo?: string
  ): Promise<{
    agent_id: string
    status: string
    summary: string
    files_analyzed: string[]
    findings?: Array<{ file: string; line?: number; severity: string; message: string }>
    proposed_diff?: string
    tests_generated?: string
    warnings: string[]
  }> {
    return await this.request('/api/agent', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, prompt, repo }),
      timeoutMs: 35000,
      retries: 0,
    })
  }

  async getConversations(): Promise<Array<{
    id: string
    title: string
    repo_name: string
    message_count: number
    created_at?: string
    updated_at?: string
  }>> {
    const res = await this.request<any>('/api/conversations', {
      method: 'GET',
      headers: this.getAuthHeaders(),
      timeoutMs: 10000,
      retries: 1,
    })
    const list = res.conversations || (Array.isArray(res) ? res : [])
    return list.map((c: any) => ({
      ...c,
      id: String(c.id),
      repo_name: c.repo_name || '',
    }))
  }

  async createConversation(title?: string, repoName?: string): Promise<{
    id: string
    title: string
    repo_name: string
  }> {
    const res = await this.request<any>('/api/conversations', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title, repo_name: repoName }),
      timeoutMs: 10000,
    })
    const c = res.conversation || res
    return {
      ...c,
      id: String(c.id),
      repo_name: c.repo_name || repoName || '',
    }
  }

  async getConversation(id: string): Promise<{
    id: string
    title: string
    repo_name: string
    messages: Array<{
      id: string
      sender: 'user' | 'assistant'
      content: string
      timestamp: string
      references?: string[]
    }>
  }> {
    const rawId = String(id).startsWith('conv-') ? id.replace('conv-', '') : id
    const res = await this.request<any>(`/api/conversations/${encodeURIComponent(rawId)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      timeoutMs: 10000,
    })
    const c = res.conversation || res
    return {
      ...c,
      id: String(c.id),
      repo_name: c.repo_name || '',
      messages: (c.messages || []).map((m: any) => ({
        id: String(m.id),
        sender: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
        timestamp: m.created_at || 'Recently',
        references: m.metadata?.references || [],
      })),
    }
  }

  async renameConversation(id: string, title: string): Promise<{ id: string; title: string }> {
    return await this.request(`/api/conversations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title }),
      timeoutMs: 10000,
    })
  }

  async deleteConversation(id: string): Promise<{ status: string }> {
    return await this.request(`/api/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      timeoutMs: 10000,
    })
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        timeoutMs: 5000,
      })
    } catch {
      // Continue cleanup even if server is unreachable
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user_token')
        localStorage.removeItem('user_profile')
        localStorage.removeItem('user')
      }
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || localStorage.getItem('user_token'))
      : null
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async getGitHubStatus(): Promise<GitHubIntegrationStatus> {
    try {
      return await this.request('/api/integrations/github/status', {
        method: 'GET',
        headers: this.getAuthHeaders(),
        timeoutMs: 8000,
        retries: 1,
      })
    } catch (e: any) {
      const msg = e?.message || ''
      const isTimeout = msg.toLowerCase().includes('timed out') || e?.name === 'AbortError'
      const isNetwork = msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network request failed')
      return {
        connected: false,
        status: (isTimeout || isNetwork) ? 'Error' : 'Disconnected',
        message: isTimeout
          ? 'Backend connection timed out after 8000ms. Please check if the FastAPI backend service is responding on port 8000.'
          : isNetwork
          ? 'Backend service unreachable. Please ensure the backend server is running on http://127.0.0.1:8000.'
          : (msg || 'Failed to retrieve GitHub connection status.'),
      }
    }
  }

  async startGitHubAuthorization(redirectUrl?: string): Promise<{ authorization_url: string; state?: string }> {
    const token = await this.ensureToken()
    let url = '/api/integrations/github/authorize'
    const query = new URLSearchParams()
    if (redirectUrl) query.set('redirect_url', redirectUrl)
    if (token) query.set('token', token)
    const qs = query.toString()
    if (qs) url += `?${qs}`

    return await this.request(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      timeoutMs: 10000,
      retries: 1,
    })
  }

  async getGitHubRepositories(page: number = 1, perPage: number = 50): Promise<{
    repositories: GitHubRepositoryItem[]
    total_retrieved: number
    selected_repo?: string
    has_next: boolean
  }> {
    return await this.request(`/api/integrations/github/repositories?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      timeoutMs: 25000,
      retries: 1,
    })
  }

  async selectGitHubRepository(repo: string): Promise<{ status: string; selected_repo: string; repository?: any }> {
    return await this.request('/api/integrations/github/select-repo', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ repo }),
      timeoutMs: 15000,
    })
  }

  async disconnectGitHub(): Promise<{ status: string; message: string }> {
    return await this.request('/api/integrations/github/disconnect', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      timeoutMs: 10000,
    })
  }

  async syncGitHubToken(token: string): Promise<{ status: string; username?: string }> {
    return await this.request('/api/integrations/github/sync-token', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ token }),
      timeoutMs: 15000,
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
