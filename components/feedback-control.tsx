'use client'

import { useId, useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { lifecycleConfig } from '@/lib/data'
import type { FeedbackRecord } from '@/lib/feedback'
import { useI18n } from '@/lib/i18n'

type FeedbackControlProps = {
  target: string
  onSubmit: (record: FeedbackRecord) => void
}

type Status = 'idle' | 'negative' | 'sent'

export function FeedbackControl({ target, onSubmit }: FeedbackControlProps) {
  const { t, lang } = useI18n()
  const id = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [comment, setComment] = useState('')

  function submit(helpful: boolean, reason: string | null) {
    onSubmit({ target, helpful, reason, comment: comment.trim(), lang, createdAt: new Date().toISOString() })
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <p role="status" className="text-sm font-medium text-success-foreground">
        {t('feedback.thanks')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span id={`${id}-q`} className="text-sm font-medium text-muted-foreground">
          {t('feedback.question')}
        </span>
        <div role="group" aria-labelledby={`${id}-q`} className="flex gap-1">
          <button
            type="button"
            onClick={() => submit(true, null)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
          >
            <ThumbsUp className="size-4" aria-hidden="true" />
            <span className="sr-only">{t('feedback.yes')}</span>
          </button>
          <button
            type="button"
            aria-pressed={status === 'negative'}
            onClick={() => setStatus('negative')}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary aria-pressed:border-primary aria-pressed:bg-secondary aria-pressed:text-primary"
          >
            <ThumbsDown className="size-4" aria-hidden="true" />
            <span className="sr-only">{t('feedback.no')}</span>
          </button>
        </div>
      </div>

      {status === 'negative' && (
        <div className="flex flex-col gap-3 rounded-xl bg-muted p-3">
          <p id={`${id}-why`} className="text-sm font-medium">
            {t('feedback.why')}
          </p>
          <div role="group" aria-labelledby={`${id}-why`} className="flex flex-wrap gap-2">
            {lifecycleConfig.feedback_reasons.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => submit(false, key)}
                className="min-h-10 rounded-full border border-border bg-card px-3 text-sm font-medium hover:border-primary hover:text-primary"
              >
                {t(key)}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (comment.trim()) submit(false, null)
            }}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor={`${id}-comment`} className="text-sm font-medium">
                {t('feedback.leave')}
              </label>
              <input
                id={`${id}-comment`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('feedback.placeholder')}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t('feedback.send')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
