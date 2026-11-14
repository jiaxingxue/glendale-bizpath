import 'server-only'
import { Redis } from '@upstash/redis'
import type { FeedbackRecord, FeedbackStore, HandoffRecord, QuestionRecord } from '@/lib/feedback'

/**
 * Usage and feedback log in Upstash Redis (KV_REST_API_URL / KV_REST_API_TOKEN).
 * Each kind of record is a capped list of JSON documents, newest first.
 */

// Production writes to "bizpath:*"; preview deployments and local dev get their own namespace,
// so testing never adds records to the live staff dashboard.
const NAMESPACE = process.env.VERCEL_ENV === 'production' ? 'bizpath' : `bizpath-${process.env.VERCEL_ENV ?? 'local'}`
const KEYS = {
  questions: `${NAMESPACE}:questions`,
  feedback: `${NAMESPACE}:feedback`,
  handoffs: `${NAMESPACE}:handoffs`,
} as const
const MAX_RECORDS = 10_000

let client: Redis | null | undefined

function redis(): Redis | null {
  if (client !== undefined) return client
  const configured = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
  if (!configured) console.warn('[store] Redis is not configured; usage and feedback are not saved.')
  client = configured ? Redis.fromEnv() : null
  return client
}

export function storeConfigured() {
  return redis() !== null
}

async function append(key: string, record: object) {
  const db = redis()
  if (!db) return
  await db.pipeline().lpush(key, record).ltrim(key, 0, MAX_RECORDS - 1).exec()
}

export const logQuestion = (record: QuestionRecord) => append(KEYS.questions, record)
export const logFeedback = (record: FeedbackRecord) => append(KEYS.feedback, record)
export const logHandoff = (record: HandoffRecord) => append(KEYS.handoffs, record)

export async function readStore(): Promise<FeedbackStore> {
  const db = redis()
  if (!db) return { questions: [], feedback: [], handoffs: [] }
  const [questions, feedback, handoffs] = await Promise.all([
    db.lrange<QuestionRecord>(KEYS.questions, 0, -1),
    db.lrange<FeedbackRecord>(KEYS.feedback, 0, -1),
    db.lrange<HandoffRecord>(KEYS.handoffs, 0, -1),
  ])
  return { questions, feedback, handoffs }
}
