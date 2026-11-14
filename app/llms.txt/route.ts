import { corpus } from '@/lib/data'

export const dynamic = 'force-static'

const PLACEHOLDER_MARKER = /^PLACEHOLDER\.\s*/

function firstSentence(text: string) {
  const clean = text.replace(PLACEHOLDER_MARKER, '').replace(/\s+/g, ' ').trim()
  const match = clean.match(/^.*?[.!?](?=\s|$)/)
  return match ? match[0] : clean
}

export function GET() {
  const lines = [
    '# Glendale BizPath',
    '',
    '> A multilingual guide to the business licenses, permits and rules that apply when opening or running a business in Glendale, California. Each requirement links to the official City or County source it is based on.',
    '',
    '## Requirements',
    '',
    ...[...corpus]
      .sort((a, b) => a.order - b.order)
      .map((req) => {
        const verified = req.verified ? `last verified ${req.verified}` : 'not yet verified'
        const summary = firstSentence(req.summary) || 'See the official source for details.'
        return `- ${req.title}: ${summary} Source: ${req.url} (${verified})`
      }),
    '',
    '## Note',
    '',
    'This is legal information, not legal advice. The City of Glendale is the authority on all business requirements; always confirm details with the City before acting.',
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
