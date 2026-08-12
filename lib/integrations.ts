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
    name: "Jira",
    logo: "/logos/jira.svg",
    status: "connected",
    detail: "Sprint 14 · 42 issues synced",
    meta: "Updated 2m ago",
  },
  {
    name: "GitHub",
    logo: "/logos/github.svg",
    status: "connected",
    detail: "monorepo · 18 open PRs",
    meta: "Updated 40s ago",
  },
  {
    name: "Slack",
    logo: "/logos/slack.svg",
    status: "syncing",
    detail: "#eng-standup · indexing threads",
    meta: "Syncing…",
  },
  {
    name: "Figma",
    logo: "/logos/figma.svg",
    status: "error",
    detail: "Design system · token access expired",
    meta: "Action needed",
  },
]
