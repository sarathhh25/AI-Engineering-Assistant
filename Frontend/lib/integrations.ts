export type IntegrationStatus = "connected" | "syncing" | "error"

export type Integration = {
  name: string
  logo: string
  status: IntegrationStatus
  detail: string
  meta: string
}

export const integrations: Integration[] = [
  {
    name: "GitHub",
    logo: "/logos/github.svg",
    status: "connected",
    detail: "monorepo · 18 open PRs",
    meta: "Updated 40s ago",
  },
]
