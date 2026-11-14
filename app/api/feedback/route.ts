import { lifecycleConfig } from '@/lib/data'
import type { FeedbackRecord } from '@/lib/feedback'
import { computeStaffStats } from '@/lib/staff-stats'
import { logFeedback, readStore } from '@/lib/store'

export const dynamic = 'force-dynamic'

const TARGET_PATTERN = /^(answer|(requirement|notice):[a-z0-9-]+)$/
const MAX_COMMENT_LENGTH = 500
const MAX_TAG_LENGTH = 32

function shortString(value: unknown, max = MAX_TAG_LENGTH) {
  return typeof value === 'string' && value.length > 0 ? value.slice(0, max) : null
}

/** Validates an incoming record and keeps only the known fields. */
function parseRecord(body: Record<string, unknown>): FeedbackRecord | null {
  const target = typeof body.target === 'string' ? body.target : ''
  if (!TARGET_PATTERN.test(target)) return null
  if (body.thumbs !== 'up' && body.thumbs !== 'down') return null
  const reason = shortString(body.reason)
  if (reason && !lifecycleConfig.feedback_reasons.includes(reason)) return null
  return {
    target,
    thumbs: body.thumbs,
    reason,
    comment: typeof body.comment === 'string' ? body.comment.trim().slice(0, MAX_COMMENT_LENGTH) : '',
    language: shortString(body.language) ?? 'unknown',
    business_type: shortString(body.business_type),
    stage: shortString(body.stage),
    time: new Date().toISOString(),
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const record = parseRecord(body)
  if (!record) return Response.json({ error: 'Invalid feedback record' }, { status: 400 })
  try {
    await logFeedback(record)
  } catch (error) {
    console.error('[api/feedback]', error)
    return Response.json({ error: 'Could not save feedback' }, { status: 503 })
  }
  return Response.json({ ok: true })
}

/** Aggregates for the /staff dashboard. Raw records (including comments) are never returned. */
export async function GET() {
  try {
    const stats = computeStaffStats(await readStore())
    return Response.json(stats, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[api/feedback]', error)
    return Response.json({ error: 'Could not read the store' }, { status: 503 })
  }
}
