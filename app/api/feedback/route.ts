import type { FeedbackStore } from '@/lib/feedback'

export const dynamic = 'force-dynamic'

/** Stub: returns an empty store until a real feedback store is connected. */
export async function GET() {
  const store: FeedbackStore = { questions: [], feedback: [] }
  return Response.json(store, { headers: { 'Cache-Control': 'no-store' } })
}
