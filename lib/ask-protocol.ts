import type { Contact } from '@/lib/data'

/**
 * Wire format of POST /api/ask: newline-delimited JSON, one event per line.
 * `meta` arrives first and carries everything rendered from data (rows, contact, flags);
 * `delta` events carry the model's text in the answer language; `english` carries the
 * governing English text when the answer was translated; `done` or `error` ends the stream.
 */

export type AnswerRow = {
  requirementId: string
  title: string
  issuer: string
  fee: string
  where: string
  whereUrl: string
  sourceUrl: string
  code: string
  lawUrl: string
  /** From the corpus entry's applies_because. */
  why: string
  /** The fact the rules engine matched to select this entry. */
  trigger: string
  linkOnly: boolean
}

export type AskMeta = {
  type: 'meta'
  lang: string
  englishQuestion: string
  businessType: string
  stage: string
  rows: AnswerRow[]
  contact: Contact
  verified: string
  /** No corpus entry matched: the reply is the "no verified source" fallback. */
  gap: boolean
  /** Legal advice or off-topic: the reply is a short decline. */
  declined: boolean
  /** Present for /api/notice: what the notice itself says, as read by the model. */
  notice?: NoticeInfo
}

export type NoticeInfo = {
  /** One English sentence: what the notice says. */
  summary: string
  /** Code section named in the notice, as written there. */
  citedCode: string | null
  /** Any date or number of days stated in the notice, as written there. Not a legal deadline. */
  deadline: string | null
}

export type AskEvent =
  | AskMeta
  | { type: 'delta'; text: string }
  | { type: 'english'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

export const ASK_CONTENT_TYPE = 'application/x-ndjson; charset=utf-8'
