/** Builds the /visit link from the current answer (entry ids) or business type page (type and stage). */
export function visitHref({
  type,
  stage,
  question,
  entries,
}: {
  type?: string | null
  stage?: string | null
  question?: string | null
  /** Corpus entry ids from an answer; the sheet then lists exactly these. */
  entries?: string[]
}) {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (stage) params.set('stage', stage)
  if (question) params.set('q', question)
  if (entries && entries.length > 0) params.set('ids', entries.join(','))
  const query = params.toString()
  return `/visit${query ? `?${query}` : ''}`
}
