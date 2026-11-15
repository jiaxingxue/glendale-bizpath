import type { AnswerRow, AskEvent, NoticeInfo } from '@/lib/ask-protocol'
import type { Contact } from '@/lib/data'

export type { AnswerRow } from '@/lib/ask-protocol'

export type AnswerContent = { summary: string; steps: string[] }

export type AssistantAnswer = {
  /** Language the answer text was written or translated into. */
  lang: string
  content: AnswerContent
  /** The governing English version, shown with "Show English". */
  english: AnswerContent
  rows: AnswerRow[]
  contact: Contact
  verified: string
  isSample: boolean
  /** No verified source matched (logged as a content gap). */
  gap: boolean
  /** Legal advice or off-topic request that was declined. */
  declined: boolean
  englishQuestion: string
  businessType: string
  stage: string
  /** Set for notice explanations: what the notice itself says. */
  notice?: NoticeInfo
}

const STEP_PATTERN = /^\s*\d+[.)]\s+/

/** Splits the model's text into the summary paragraph and the numbered next steps. */
export function parseAnswerText(text: string): AnswerContent {
  const summary: string[] = []
  const steps: string[] = []
  for (const line of text.split('\n')) {
    if (STEP_PATTERN.test(line)) steps.push(line.replace(STEP_PATTERN, '').trim())
    else if (line.trim() && steps.length === 0) summary.push(line.trim())
    else if (line.trim() && steps.length > 0) steps[steps.length - 1] += ` ${line.trim()}`
  }
  return { summary: summary.join(' '), steps }
}

export class AssistantError extends Error {}

export type OnUpdate = (answer: AssistantAnswer) => void

/**
 * Asks POST /api/ask and streams the result. `onUpdate` is called with the answer so far: first when
 * the rules engine's rows arrive, then on every chunk of text. Resolves with the final answer.
 */
export function askAssistant(question: string, lang: string, onUpdate?: OnUpdate) {
  return streamAnswer('/api/ask', { question, lang }, onUpdate)
}

/** Sends pasted notice text to POST /api/notice; streams like askAssistant. */
export function explainNotice(text: string, lang: string, onUpdate?: OnUpdate) {
  return streamAnswer('/api/notice', { text, lang }, onUpdate)
}

async function streamAnswer(path: string, body: object, onUpdate?: OnUpdate): Promise<AssistantAnswer> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok || !response.body) throw new AssistantError(`Ask failed with status ${response.status}`)

  let answer: AssistantAnswer | null = null
  let text = ''
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''

  const handle = (event: AskEvent) => {
    switch (event.type) {
      case 'meta':
        answer = {
          lang: event.lang,
          content: { summary: '', steps: [] },
          english: { summary: '', steps: [] },
          rows: event.rows,
          contact: event.contact,
          verified: event.verified,
          isSample: false,
          gap: event.gap,
          declined: event.declined,
          englishQuestion: event.englishQuestion,
          businessType: event.businessType,
          stage: event.stage,
          notice: event.notice,
        }
        break
      case 'delta':
        if (!answer) return
        text += event.text
        answer = { ...answer, content: parseAnswerText(text) }
        if (answer.lang === 'en') answer.english = answer.content
        break
      case 'english':
        if (!answer) return
        answer = { ...answer, english: parseAnswerText(event.text) }
        break
      case 'error':
        throw new AssistantError(event.message)
      case 'done':
        return
    }
    if (answer) onUpdate?.(answer)
  }

  for (;;) {
    const { value, done } = await reader.read()
    if (value) buffer += value
    let newline = buffer.indexOf('\n')
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim()
      buffer = buffer.slice(newline + 1)
      if (line) handle(JSON.parse(line) as AskEvent)
      newline = buffer.indexOf('\n')
    }
    if (done) break
  }
  if (!answer) throw new AssistantError('Empty response')
  return answer
}

/** Section G.9 of the plan. Shown with the label "Sample notice for demonstration". */
export const SAMPLE_NOTICE_TEXT = `SAMPLE NOTICE FOR DEMONSTRATION — NOT A REAL CITY DOCUMENT
To: Owner, Anna's Café
We received a report that your business provides plastic utensils and straws
with takeout orders without the customer asking for them. Glendale Municipal Code
Chapter 8.46 allows disposable foodware accessories only when a customer requests
them. Please review your takeout and online ordering practices.`
