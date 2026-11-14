import { corpus, type Requirement } from '@/lib/data'
import {
  HARD_TO_UNDERSTAND_REASON,
  NEED_PERSON_REASON,
  REQUIREMENT_TARGET_PREFIX,
  type FeedbackStore,
} from '@/lib/feedback'

const REVIEW_AFTER_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000
const UNKNOWN = 'unknown'

export type Count = { key: string; count: number }

export type ReviewEntry = {
  id: string
  title: string
  url: string
  verified: string
  daysSince: number | null
}

/** Corpus entries whose verified date is missing, unparseable, or older than 30 days. */
export function entriesDueForReview(now = Date.now()): ReviewEntry[] {
  return corpus
    .map((req) => {
      const time = req.verified ? Date.parse(req.verified) : Number.NaN
      const daysSince = Number.isNaN(time) ? null : Math.floor((now - time) / DAY_MS)
      return { id: req.id, title: req.title, url: req.url, verified: req.verified, daysSince }
    })
    .filter((entry) => entry.daysSince === null || entry.daysSince > REVIEW_AFTER_DAYS)
    .sort((a, b) => (b.daysSince ?? Number.POSITIVE_INFINITY) - (a.daysSince ?? Number.POSITIVE_INFINITY))
}

function tally<T>(items: T[], keyOf: (item: T) => string) {
  const counts = new Map<string, number>()
  for (const item of items) {
    const key = keyOf(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count)
}

function percent(part: number, total: number) {
  return total === 0 ? null : Math.round((part / total) * 100)
}

const requirementsById = new Map<string, Requirement>(corpus.map((req) => [req.id, req]))

export function requirementFromTarget(target: string) {
  if (!target.startsWith(REQUIREMENT_TARGET_PREFIX)) return undefined
  return requirementsById.get(target.slice(REQUIREMENT_TARGET_PREFIX.length))
}

const VERIFIED = 'verified'

/** True when the answer cited at least one entry marked verified in the corpus. */
function hasVerifiedSource(entryIds: string[]) {
  return entryIds.some((id) => requirementsById.get(id)?.confidence === VERIFIED)
}

export function computeStaffStats({ questions, feedback, handoffs }: FeedbackStore) {
  const requirementFeedback = feedback.filter((item) => requirementFromTarget(item.target))
  const negative = requirementFeedback.filter((item) => item.thumbs === 'down')

  const topQuestions = tally(questions, (q) => `${q.english_question}\u0000${q.language}`).map(({ key, count }) => {
    const [question, lang] = key.split('\u0000')
    return { question, lang, count }
  })

  const hardToUnderstand = tally(
    negative.filter((item) => item.reason === HARD_TO_UNDERSTAND_REASON),
    (item) => item.target,
  )

  const flagged = tally(
    negative.filter((item) => item.reason && item.reason !== HARD_TO_UNDERSTAND_REASON),
    (item) => `${item.target}\u0000${item.reason}`,
  ).map(({ key, count }) => {
    const [target, reason] = key.split('\u0000')
    return { target, reason, count }
  })

  const needPerson = feedback.filter((item) => item.reason === NEED_PERSON_REASON).length

  return {
    questionsAsked: questions.length,
    /** Answered (not declined) with at least one verified corpus entry. */
    verifiedSourceRate: percent(
      questions.filter((q) => !q.declined && hasVerifiedSource(q.entry_ids)).length,
      questions.length,
    ),
    legalAdviceDeclined: questions.filter((q) => q.intent === 'legal_advice').length,
    /** "Need a person" feedback plus visit sheets opened. */
    handedOff: needPerson + handoffs.length,
    thumbsUpRate: percent(feedback.filter((item) => item.thumbs === 'up').length, feedback.length),
    topQuestions,
    /** No verified source, or a legal question the City may want to cover with published guidance. */
    contentGaps: tally(
      questions.filter((q) => q.gap || q.intent === 'legal_advice'),
      (q) => q.english_question,
    ),
    hardToUnderstand,
    flagged,
    byLanguage: tally(questions, (q) => q.language || UNKNOWN),
    byBusinessType: tally(questions, (q) => q.business_type || UNKNOWN),
    byStage: tally(questions, (q) => q.stage || UNKNOWN),
  }
}

export type StaffStats = ReturnType<typeof computeStaffStats>
