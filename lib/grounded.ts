import 'server-only'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText, streamText } from 'ai'
import stringsJson from '@/data/ui-strings.json'
import { ASK_CONTENT_TYPE, type AnswerRow, type AskEvent } from '@/lib/ask-protocol'
import { isLinkOnly, type Requirement } from '@/lib/data'
import type { SelectedEntry } from '@/lib/rules'

/** The grounded answer step shared by /api/ask and /api/notice. */

export const MODEL = anthropic('claude-haiku-5-5')
// Claude Haiku 5.5 rejects sampling parameters, so temperature is not sent. Consistency comes from
// the rules engine (same facts → same entries) and from low effort on both calls.
export const MODEL_OPTIONS = { anthropic: { effort: 'low' as const } }
const strings = stringsJson as Record<string, Record<string, string>>

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hy: 'Armenian',
  es: 'Spanish',
  ko: 'Korean',
  tl: 'Tagalog',
  fa: 'Farsi (Persian)',
}

// ---------- Step 3: grounded answer ----------

/** Section G.2 of the plan ("System prompt (grounded assistant, Revision 2)"), with {lang} filled in. */
export function groundedSystemPrompt(langName: string) {
  return `You are BizPath, an informational assistant for small businesses in the City of Glendale, CA.
You are NOT a lawyer or city official and you never make legal or eligibility determinations.
RULES:
1. Use ONLY the corpus entries provided in this turn. Every factual sentence must end with its
   citation tag like [brc-fee]. If no entry supports a fact, do not state it.
2. Which obligations apply is decided by the rules engine output, not by you. Explain them in
   lifecycle order: Start → Location (before you sign a lease) → Hire → Ongoing compliance.
3. Output format: (a) 2-sentence summary; (b) markdown table Requirement | Who issues it | Fee |
   Where to apply | Source; (c) numbered next steps; (d) "Talk to a person" with the desk from the
   entries; (e) the line "Informational only — not legal advice. Verify with the City of Glendale."
4. Language: write the answer in ${langName}. If ${langName} is "auto", use the language of the user's
   question. Keep fees, URLs, phone numbers and code section numbers unchanged. Keep official names
   (e.g. "Business Registration Certificate", "GlendalePermits") in English and add a translation in
   parentheses the first time. If the answer is not in English, end with the line (translated):
   "Machine translation — the English version governs."
5. If asked for legal advice, how to avoid a rule, tips/wage shortcuts, or anything off-topic,
   briefly decline in the user's language and point to the right desk. If you lack a verified
   source, say (in the user's language): "I don't have a verified Glendale source for that yet,"
   give the Permit Services Center contact, and set gap=true.
6. Never request or store personal information.

APP OUTPUT FORMAT (replaces rule 3 and the closing line in rule 4): the app already shows the
requirements table, the "Talk to a person" card, the disclaimer and the machine-translation line from
the corpus data. Write ONLY:
- the 2-sentence summary as one paragraph, then a blank line,
- the numbered next steps in lifecycle order, one per line, formatted "1. ...".
Each next step must restate an action that an entry describes; never add actions, documents, fees,
dates or contacts that the entries do not contain (for example, do not invent "create an account").
No headings, no table, no bold, no other text. Entries marked "link_only" may only be named with their
issuer and told to check the official link (without calling it "link only"); never state a fee,
deadline or detail for them.`
}

function entryForModel(entry: Requirement) {
  if (isLinkOnly(entry)) {
    return { id: entry.id, link_only: true, title: entry.title, issuer: entry.issuer, url: entry.url }
  }
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    issuer: entry.issuer,
    fee: entry.fee || undefined,
    documents: entry.documents.length > 0 ? entry.documents : undefined,
    deadlines: entry.deadlines.length > 0 ? entry.deadlines : undefined,
    contact: entry.contact,
    apply_url: entry.apply_url || undefined,
    url: entry.url,
    code: entry.code || undefined,
    stages: entry.stages,
  }
}

/** `context` describes what the owner asked or received; the entries are the only facts allowed. */
export function answerPrompt(context: string, selected: SelectedEntry[]) {
  const entries = selected.map(({ entry }) => entryForModel(entry))
  return `${context}

Corpus entries selected by the rules engine (use only these):
${JSON.stringify(entries, null, 2)}`
}

// ---------- Fixed replies (decline / no verified source) ----------

export type FixedReplyKey = 'answer.no_source' | 'answer.decline_legal' | 'answer.decline_off_topic'

export function fixedReply(key: FixedReplyKey, lang: string) {
  return { text: strings[lang]?.[key], english: strings.en[key] }
}

// ---------- Rows rendered from data ----------

export function toRow({ entry, because }: SelectedEntry): AnswerRow {
  const linkOnly = isLinkOnly(entry)
  return {
    requirementId: entry.id,
    title: entry.title,
    issuer: entry.issuer,
    fee: linkOnly ? '' : entry.fee,
    where: linkOnly ? '' : entry.contact.desk,
    whereUrl: linkOnly ? '' : entry.apply_url,
    sourceUrl: entry.url,
    code: linkOnly ? '' : entry.code,
    lawUrl: linkOnly ? '' : entry.law_url,
    why: linkOnly ? '' : entry.applies_because,
    trigger: because,
    linkOnly,
  }
}

export function latestVerified(dates: string[]) {
  return dates.filter(Boolean).sort().pop() ?? ''
}

// ---------- Streaming helpers ----------

export type Send = (event: AskEvent) => void

/** Answer language: an explicit non-English interface choice wins; otherwise the detected language. */
export function resolveLanguage(requested: string, detected: string) {
  return requested !== 'auto' && requested !== 'en' ? requested : detected.toLowerCase() || 'en'
}

export function languageName(lang: string) {
  return LANGUAGE_NAMES[lang] ?? lang
}

/** Sends a fixed reply (decline or "no verified source"), translated by the model only when no dictionary text exists. */
export async function sendFixedReply(send: Send, key: FixedReplyKey, lang: string) {
  const reply = fixedReply(key, lang)
  if (reply.text) {
    send({ type: 'delta', text: reply.text })
  } else {
    const translation = streamText({
      model: MODEL,
      providerOptions: MODEL_OPTIONS,
      instructions: `Translate the user's text into ${languageName(lang)}. Keep phone numbers, names and "Permit Services Center" unchanged. Output only the translation.`,
      prompt: reply.english,
      maxOutputTokens: 500,
    })
    for await (const text of translation.textStream) send({ type: 'delta', text })
  }
  if (lang !== 'en') send({ type: 'english', text: reply.english })
}

/** Streams the model's explanation of ONLY the selected entries, plus the governing English version. */
export async function streamGroundedAnswer(send: Send, prompt: string, lang: string) {
  const english =
    lang === 'en'
      ? null
      : generateText({
          model: MODEL,
          providerOptions: MODEL_OPTIONS,
          instructions: groundedSystemPrompt(LANGUAGE_NAMES.en),
          prompt,
          maxOutputTokens: 2000,
        })
  // streamText reports errors through onError instead of throwing, so capture and rethrow.
  let streamError: unknown = null
  const answer = streamText({
    model: MODEL,
    providerOptions: MODEL_OPTIONS,
    instructions: groundedSystemPrompt(languageName(lang)),
    prompt,
    maxOutputTokens: 2000,
    onError: ({ error }) => {
      streamError = error
    },
  })
  for await (const text of answer.textStream) send({ type: 'delta', text })
  if (streamError) throw streamError
  if (english) send({ type: 'english', text: (await english).text })
}

/** Runs `work` inside an NDJSON stream response; errors become an "error" event. */
export function ndjsonResponse(label: string, work: (send: Send) => Promise<void>) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send: Send = (event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}
`))
      try {
        await work(send)
        send({ type: 'done' })
      } catch (error) {
        console.error(`[${label}]`, error)
        send({ type: 'error', message: 'The assistant is unavailable right now.' })
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, { headers: { 'Content-Type': ASK_CONTENT_TYPE, 'Cache-Control': 'no-store' } })
}
