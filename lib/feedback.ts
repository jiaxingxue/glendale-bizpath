/** Record types shared by the client, the API routes and the staff dashboard. No personal data. */

export type FeedbackRecord = {
  /** What the feedback is about: "answer", "requirement:<id>" or "notice:<id>". */
  target: string
  thumbs: 'up' | 'down'
  /** A key from lifecycle-config feedback_reasons, e.g. "feedback.unclear". */
  reason: string | null
  /** Optional free text; never shown on the dashboard. */
  comment: string
  language: string
  business_type: string | null
  stage: string | null
  time: string
}

/** One question asked through the assistant. */
export type QuestionRecord = {
  time: string
  /** English version of the question; the owner's original text is not stored. */
  english_question: string
  language: string
  business_type: string
  stage: string
  intent: 'requirements' | 'legal_advice' | 'off_topic'
  /** Corpus entries the rules engine selected. */
  entry_ids: string[]
  /** No corpus entry matched ("no verified source" fallback). */
  gap: boolean
  declined: boolean
}

/** A hand-off to City staff, e.g. a visit sheet being opened. */
export type HandoffRecord = {
  time: string
  kind: 'visit'
  language: string
  business_type: string | null
  stage: string | null
}

export type FeedbackStore = {
  questions: QuestionRecord[]
  feedback: FeedbackRecord[]
  handoffs: HandoffRecord[]
}

/** Context a feedback control attaches to its record. */
export type FeedbackContext = { business_type?: string | null; stage?: string | null }

export const REQUIREMENT_TARGET_PREFIX = 'requirement:'
export const HARD_TO_UNDERSTAND_REASON = 'feedback.unclear'
export const NEED_PERSON_REASON = 'feedback.person'

/** Sends one feedback record to the live store. Failures are logged, never shown to the owner. */
export function handleFeedback(record: FeedbackRecord) {
  fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
    keepalive: true,
  }).catch((error) => console.error('[feedback]', error))
}
