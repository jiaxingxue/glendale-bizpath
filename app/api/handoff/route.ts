import { getBusinessType, getStage } from '@/lib/data'
import type { HandoffRecord } from '@/lib/feedback'
import { logHandoff } from '@/lib/store'

export const dynamic = 'force-dynamic'

/** Logs a hand-off to City staff (a visit sheet opened). Only known type and stage ids are kept. */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (body.kind !== 'visit') return Response.json({ error: 'Invalid hand-off record' }, { status: 400 })
  const record: HandoffRecord = {
    kind: 'visit',
    language: typeof body.language === 'string' ? body.language.slice(0, 16) : 'unknown',
    business_type: typeof body.business_type === 'string' ? (getBusinessType(body.business_type)?.id ?? null) : null,
    stage: typeof body.stage === 'string' ? (getStage(body.stage)?.id ?? null) : null,
    time: new Date().toISOString(),
  }
  try {
    await logHandoff(record)
  } catch (error) {
    console.error('[api/handoff]', error)
    return Response.json({ error: 'Could not save hand-off' }, { status: 503 })
  }
  return Response.json({ ok: true })
}
