import { generateText, Output } from 'ai'
import { z } from 'zod'
import type { AskMeta } from '@/lib/ask-protocol'
import { corpus, permitCenter } from '@/lib/data'
import {
  answerPrompt,
  latestVerified,
  MODEL,
  MODEL_OPTIONS,
  ndjsonResponse,
  resolveLanguage,
  sendFixedReply,
  streamGroundedAnswer,
  toRow,
} from '@/lib/grounded'
import type { SelectedEntry } from '@/lib/rules'
import { logQuestion } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_NOTICE_LENGTH = 4000

/** Notice topics the corpus supports, mapped to entries in code (plan section G.9). */
const NOTICE_TOPICS = {
  foodware_accessories: { entries: ['foodware-on-request'], because: 'The notice is about disposable foodware accessories' },
  polystyrene: { entries: ['polystyrene-ban'], because: 'The notice is about polystyrene foodware' },
  registration_expired: { entries: ['brc-required', 'brc-fee'], because: 'The notice is about your Business Registration Certificate' },
} as const

type NoticeTopic = keyof typeof NOTICE_TOPICS

function entriesForTopic(topic: NoticeTopic | 'unknown'): SelectedEntry[] {
  if (topic === 'unknown') return []
  const { entries, because } = NOTICE_TOPICS[topic]
  return corpus.filter((entry) => (entries as readonly string[]).includes(entry.id)).map((entry) => ({ entry, because }))
}

const noticeSchema = z.object({
  english_summary: z.string().describe('One sentence: what the notice says.'),
  detected_language: z.string().describe('ISO 639-1 code of the language the notice is written in.'),
  cited_code: z.string().nullable().describe('Any code section named in the notice, or null.'),
  topic: z.enum(['foodware_accessories', 'polystyrene', 'registration_expired', 'unknown']),
  deadline_in_notice: z.string().nullable().describe('Any date or number of days stated in the notice, exactly as written, or null.'),
})

/** Section G.9 of the plan ("Extraction prompt"); the JSON shape is enforced by the schema. */
const NOTICE_INSTRUCTIONS = `You read a notice or letter a small business in Glendale, CA received. Return JSON only:
{"english_summary": "one sentence, what the notice says",
 "detected_language": "...",
 "cited_code": "any code section named in the notice, or null",
 "topic": "foodware_accessories | polystyrene | registration_expired | unknown",
 "deadline_in_notice": "any date or number of days stated in the notice, or null"}
Do not explain the law. Do not guess a topic; use "unknown" unless the text clearly matches.
Do not include names of people or businesses, addresses or account numbers in english_summary.`

export async function POST(request: Request) {
  let body: { text?: unknown; lang?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, MAX_NOTICE_LENGTH) : ''
  const requestedLang = typeof body.lang === 'string' ? body.lang : 'auto'
  if (!text) return Response.json({ error: 'Missing notice text' }, { status: 400 })

  return ndjsonResponse('api/notice', async (send) => {
    // 1. READ THE NOTICE (model): what it says, nothing about the law.
    const { output: notice } = await generateText({
      model: MODEL,
      providerOptions: MODEL_OPTIONS,
      instructions: NOTICE_INSTRUCTIONS,
      prompt: text,
      output: Output.object({ schema: noticeSchema }),
      maxOutputTokens: 1000,
    })
    const lang = resolveLanguage(requestedLang, notice.detected_language)

    // 2. MAP TOPIC → ENTRIES (code)
    const selected = entriesForTopic(notice.topic)
    const gap = selected.length === 0

    const meta: AskMeta = {
      type: 'meta',
      lang,
      englishQuestion: notice.english_summary,
      businessType: notice.topic === 'registration_expired' || gap ? 'unknown' : 'food',
      stage: 'notice',
      rows: selected.map(toRow),
      contact: permitCenter,
      verified: latestVerified(selected.map(({ entry }) => entry.verified)),
      gap,
      declined: false,
      notice: { summary: notice.english_summary, citedCode: notice.cited_code, deadline: notice.deadline_in_notice },
    }
    send(meta)

    const logged = logQuestion({
      time: new Date().toISOString(),
      english_question: `[Notice] ${notice.english_summary}`.slice(0, 500),
      language: lang,
      business_type: meta.businessType,
      stage: 'notice',
      intent: 'requirements',
      entry_ids: selected.map(({ entry }) => entry.id),
      gap,
      declined: false,
    }).catch((error) => console.error('[api/notice] log failed', error))

    if (gap) {
      await sendFixedReply(send, 'answer.no_source', lang)
    } else {
      // 3. ANSWER: the same grounded step as /api/ask, over the mapped entries only.
      const context = `The owner received a notice. What the notice says (summary): ${notice.english_summary}
Code section named in the notice: ${notice.cited_code ?? 'none'}
Explain what the rule in the entries means for the owner and what to do. Do not restate or interpret any date in the notice,
and do not decide which case applies to the owner (for example, renewal versus a new application): state each case as the
entries word it and let the owner confirm with the desk.`
      await streamGroundedAnswer(send, answerPrompt(context, selected), lang)
    }
    await logged
  })
}
