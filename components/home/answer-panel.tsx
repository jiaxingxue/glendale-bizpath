'use client'

import { useState } from 'react'
import { ChevronDown, ClipboardList, ExternalLink, Languages } from 'lucide-react'
import type { AssistantAnswer } from '@/lib/assistant'
import { handleFeedback } from '@/lib/feedback'
import { useI18n } from '@/lib/i18n'
import { EnglishSourceNote } from '@/components/english-source-note'
import { FeedbackControl } from '@/components/feedback-control'
import { LangLink } from '@/components/lang-link'
import { TalkToPerson } from '@/components/talk-to-person'
import { LawLink } from '@/components/type/requirement-card'

type AnswerPanelProps = {
  question: string
  answer: AssistantAnswer
  /** True while text is still arriving; the summary and steps are rendered as they stream in. */
  streaming?: boolean
  visitHref: string
  onFollowUp: (question: string) => void
}

export function AnswerPanel({ question, answer, streaming = false, visitHref, onFollowUp }: AnswerPanelProps) {
  const { t } = useI18n()
  const [showEnglish, setShowEnglish] = useState(false)
  const [followUp, setFollowUp] = useState('')
  const translated = answer.lang !== 'en'
  const englishReady = answer.english.summary !== '' || answer.english.steps.length > 0
  const content = showEnglish && englishReady ? answer.english : answer.content
  const contentLang = showEnglish ? 'en' : answer.lang

  return (
    <section
      aria-labelledby="answer-title"
      aria-busy={streaming}
      className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 text-card-foreground md:p-6"
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="answer-title" className="text-xl">
            {t('answer.title')}
          </h2>
          {answer.isSample && (
            <span className="rounded-full bg-warning px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
              {t('answer.sample')}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">{t('answer.asked')}:</span> {question}
        </p>
      </header>

      {translated && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
          <span className="flex items-center gap-2">
            <Languages className="size-4 text-primary" aria-hidden="true" />
            {t('answer.mt')}
          </span>
          <button
            type="button"
            aria-pressed={showEnglish}
            onClick={() => setShowEnglish((v) => !v)}
            className="min-h-9 rounded-md px-2 font-medium text-primary underline underline-offset-4"
          >
            {showEnglish ? t('answer.show_translation') : t('answer.show_en')}
          </button>
        </div>
      )}

      <div aria-live="polite" lang={contentLang} className="flex flex-col gap-5">
        <p className="text-lg leading-relaxed text-pretty">
          <CitedText text={content.summary} />
        </p>

        {content.steps.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg">{t('answer.next')}</h3>
            <ol className="flex flex-col gap-2">
              {content.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 leading-relaxed">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">
                    <CitedText text={step} />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {answer.rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg">{t(answer.declined ? 'answer.related_declined' : 'answer.applies')}</h3>
          <EnglishSourceNote />
          <div className="overflow-x-auto rounded-xl border border-border">
            <table lang="en" className="w-full min-w-xl text-start text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{t('answer.col_req')}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{t('answer.col_issuer')}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{t('answer.col_fee')}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{t('answer.col_where')}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{t('answer.col_source')}</th>
                </tr>
              </thead>
              <tbody>
                {answer.rows.map((row) => (
                  <tr key={row.requirementId} className="border-t border-border align-top">
                    <th scope="row" className="px-3 py-3 text-start font-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{row.title}</span>
                        {row.linkOnly && (
                          <span className="w-fit rounded-full bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground">
                            {t('answer.link_only')}
                          </span>
                        )}
                        {row.code && <LawLink code={row.code} url={row.lawUrl} />}
                        {(row.why || row.trigger) && (
                          <details className="group">
                            <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1 text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
                              {t('req.why')}
                              <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                            </summary>
                            {row.why && <p className="pt-1 leading-relaxed text-muted-foreground">{row.why}</p>}
                            {row.trigger && (
                              <p className="pt-1 text-xs text-muted-foreground">
                                <span className="font-medium">{t('answer.matched')}:</span> {row.trigger}
                              </p>
                            )}
                          </details>
                        )}
                      </div>
                    </th>
                    <td className="px-3 py-3 leading-relaxed">{row.issuer}</td>
                    <td className="px-3 py-3 leading-relaxed">{row.fee || '—'}</td>
                    <td className="px-3 py-3 leading-relaxed">
                      {row.whereUrl ? (
                        <a href={row.whereUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
                          {row.where}
                        </a>
                      ) : (
                        row.where
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {row.sourceUrl && (
                        <a
                          href={row.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4"
                        >
                          {t('req.city_source')}
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TalkToPerson contact={answer.contact} headingLevel={3} />

      <p className="text-sm text-muted-foreground">
        {answer.verified ? t('answer.verified', { date: answer.verified }) : t('answer.not_verified')}
        {' · '}
        {t('legal.short')}
      </p>

      <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-start sm:justify-between">
        <LangLink
          href={visitHref}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <ClipboardList className="size-4" aria-hidden="true" />
          {t('type.prepare')}
        </LangLink>
        <FeedbackControl
          target="answer"
          onSubmit={handleFeedback}
          context={{ business_type: answer.businessType, stage: answer.stage }}
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = followUp.trim()
          if (!trimmed) return
          onFollowUp(trimmed)
          setFollowUp('')
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="followup-input" className="text-sm font-medium">
          {t('answer.followup_label')}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="followup-input"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            placeholder={t('answer.followup_placeholder')}
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="h-11 rounded-xl border border-primary px-5 text-sm font-semibold text-primary hover:bg-secondary"
          >
            {t('answer.followup_button')}
          </button>
        </div>
      </form>
    </section>
  )
}

const CITATION = /(\[[a-z0-9-]+\])/
const IS_CITATION = /^\[[a-z0-9-]+\]$/

/** Renders the model's [entry-id] citation tags as small labels so each sentence stays traceable. */
function CitedText({ text }: { text: string }) {
  return (
    <>
      {text.split(CITATION).map((part, i) =>
        IS_CITATION.test(part) ? (
          <span key={i} className="ms-1 rounded bg-secondary px-1 py-0.5 align-middle font-mono text-xs text-secondary-foreground">
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}
