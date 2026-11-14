'use client'

import { useI18n } from '@/lib/i18n'

/** Empty answer area. Render assistant output here once the assistant is wired up. */
export function AnswerPanel() {
  const { t } = useI18n()
  return (
    <section
      aria-labelledby="answer-title"
      aria-live="polite"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-card-foreground md:p-6"
    >
      <h2 id="answer-title" className="text-lg">
        {t('answer.title')}
      </h2>
      <div className="min-h-24" />
    </section>
  )
}
