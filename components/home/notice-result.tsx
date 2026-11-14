'use client'

import { FileText } from 'lucide-react'
import type { NoticeExplanation } from '@/lib/assistant'
import { corpus } from '@/lib/data'
import { handleFeedback } from '@/lib/feedback'
import { useI18n } from '@/lib/i18n'
import { EnglishSourceNote } from '@/components/english-source-note'
import { FeedbackControl } from '@/components/feedback-control'
import { RequirementCard } from '@/components/type/requirement-card'

export function NoticeResult({ explanation }: { explanation: NoticeExplanation }) {
  const { t } = useI18n()
  const requirement = corpus.find((req) => req.id === explanation.requirementId)

  return (
    <section
      aria-labelledby="notice-result-title"
      aria-live="polite"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-5 text-foreground md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="notice-result-title" className="text-xl">
          {t('notice.result_title')}
        </h2>
        {explanation.isSample && (
          <span className="rounded-full bg-warning px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
            {t('answer.sample')}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-card p-4">
        <FileText className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-sans font-medium text-muted-foreground">{t('notice.says')}</h3>
          <p className="text-lg leading-relaxed">{explanation.says}</p>
        </div>
      </div>

      {requirement && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg">{t('notice.related')}</h3>
          <EnglishSourceNote />
          <RequirementCard requirement={requirement} headingLevel={4} showFeedback={false} />
        </div>
      )}

      <FeedbackControl target={`notice:${explanation.requirementId}`} onSubmit={handleFeedback} />
    </section>
  )
}
