export function visitHref({
  type,
  stage,
  question,
}: {
  type?: string | null
  stage?: string | null
  question?: string | null
}) {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (stage) params.set('stage', stage)
  if (question) params.set('q', question)
  const query = params.toString()
  return `/visit${query ? `?${query}` : ''}`
}
