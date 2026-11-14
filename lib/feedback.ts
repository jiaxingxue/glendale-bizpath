export type FeedbackRecord = {
  /** What the feedback is about, e.g. "requirement:health-permit" or "answer". */
  target: string
  helpful: boolean
  reason: string | null
  comment: string
  lang: string
  createdAt: string
}

/** One question asked through the assistant, as logged for the staff dashboard. */
export type QuestionRecord = {
  /** English version of the question, used to group the same question across languages. */
  question_en: string
  lang: string
  business_type: string | null
  stage: string | null
  /** Ids of verified corpus entries the answer cited. Empty means no verified source was found. */
  sources: string[]
  declined_legal_advice: boolean
  handed_off: boolean
  createdAt: string
}

export type FeedbackStore = {
  questions: QuestionRecord[]
  feedback: FeedbackRecord[]
}

export const REQUIREMENT_TARGET_PREFIX = 'requirement:'
export const HARD_TO_UNDERSTAND_REASON = 'feedback.unclear'

/** Placeholder handler: feedback is not persisted yet. */
export function handleFeedback(_record: FeedbackRecord) {}
