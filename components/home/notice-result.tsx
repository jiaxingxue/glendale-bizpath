'use client'

import { FileText, Languages } from 'lucide-react'
import type { AssistantAnswer } from '@/lib/assistant'
import { corpus, permitCenter } from '@/lib/data'
import { handleFeedback } from '@/lib/feedback'
import { useI18n } from '@/lib/i18n'
import { EnglishSourceNote } from '@/components/english-source-note'
import { FeedbackControl } from '@/components/feedback-control'
import { TalkToPerson } from '@/components/talk-to-person'
import { RequirementCard } from '@/components/type/requirement-card'
import { CitedText } from '@/components/home/answer-panel'

type NoticeResultProps = {
  answer: AssistantAnswer
  streaming: boolean
  /** The owner used the built-in sample notice. */
  isSample: boolean
}

export function NoticeResult({ answer, streaming, isSample }: NoticeResultProps) {
  const { t } = useI18n()
  const notice = answer.notice
  const requirements = answer.rows
    .map((row) => corpus.find((req) => req.id === row.requirementId))
    .filter((req) => req !== undefined)
  const contact = requirements[0]?.contact ?? permitCenter
  const feedbackTarget = requirements[0] ? `notice:${requirements[0].id}` : 'answer'

  return (
    <section
      aria-labelledby="notice-result-title"
      aria-busy={streaming}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-5 text-foreground md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="notice-result-title" className="text-xl">
          {t('notice.result_title')}
        </h2>
        {isSample && (
          <span className="rounded-full bg-warning px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
            {t('notice.sample')}
          </span>
        )}
      </div>

      {notice && (
        <div className="flex items-start gap-3 rounded-xl bg-card p-4">
          <FileText className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-sans font-medium text-muted-foreground">{t('notice.says')}</h3>
            <p lang="en" className="text-lg leading-relaxed">
              {notice.summary}
            </p>
            <dl className="flex flex-col gap-1 text-sm">
              {notice.citedCode && (
                <div className="flex flex-wrap gap-1">
                  <dt className="font-medium">{t('notice.code')}:</dt>
                  <dd>{notice.citedCode}</dd>
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                <dt className="font-medium">{t('notice.date')}:</dt>
                <dd>{notice.deadline ? `“${notice.deadline}”` : t('notice.no_date')}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">{t('notice.date_note')}</p>
          </div>
        </div>
      )}

      {answer.lang !== 'en' && (
        <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
          <Languages className="size-4 text-primary" aria-hidden="true" />
          {t('answer.mt')}
        </p>
      )}

      {(answer.content.summary || answer.content.steps.length > 0) && (
        <div aria-live="polite" lang={answer.lang} className="flex flex-col gap-3">
          <h3 className="text-lg">{t('notice.meaning')}</h3>
          {answer.content.summary && (
            <p className="leading-relaxed">
              <CitedText text={answer.content.summary} />
            </p>
          )}
          {answer.content.steps.length > 0 && (
            <ol className="flex list-decimal flex-col gap-1 ps-5 leading-relaxed">
              {answer.content.steps.map((step, i) => (
                <li key={i}>
                  <CitedText text={step} />
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {requirements.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg">{t('notice.related')}</h3>
          <EnglishSourceNote />
          {requirements.map((req) => (
            <RequirementCard key={req.id} requirement={req} headingLevel={4} showFeedback={false} />
          ))}
        </div>
      )}

      <TalkToPerson contact={contact} headingLevel={3} />
      <p className="text-sm text-muted-foreground">{t('legal.short')}</p>

      {!streaming && (
        <FeedbackControl
          target={feedbackTarget}
          onSubmit={handleFeedback}
          context={{ business_type: answer.businessType, stage: 'notice' }}
        />
      )}
    </section>
  )
}
