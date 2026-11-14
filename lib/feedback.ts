export type FeedbackRecord = {
  /** What the feedback is about, e.g. "requirement:health-permit" or "answer". */
  target: string
  helpful: boolean
  reason: string | null
  comment: string
  lang: string
  createdAt: string
}

/** Placeholder handler: feedback is not persisted yet. */
export function handleFeedback(_record: FeedbackRecord) {}
