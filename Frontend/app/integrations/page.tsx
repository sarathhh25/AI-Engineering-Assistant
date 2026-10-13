import { redirect } from 'next/navigation'

export default async function IntegrationsRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const q = new URLSearchParams()
  q.set('tab', 'integrations')
  for (const [key, value] of Object.entries(resolvedParams || {})) {
    if (value && typeof value === 'string' && key !== 'tab') {
      q.set(key, value)
    }
  }
  redirect(`/dashboard?${q.toString()}`)
}
