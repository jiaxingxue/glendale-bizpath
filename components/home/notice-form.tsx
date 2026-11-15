'use client'

import { useState } from 'react'
import { SAMPLE_NOTICE_TEXT } from '@/lib/assistant'
import { useI18n } from '@/lib/i18n'

export function NoticeForm({ onSubmit }: { onSubmit: (text: string, isSample: boolean) => void }) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const isSample = text === SAMPLE_NOTICE_TEXT

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const trimmed = text.trim()
        if (trimmed) onSubmit(trimmed, isSample)
      }}
      className="flex flex-col gap-3 rounded-xl bg-muted p-4 md:p-5"
      aria-labelledby="notice-title"
    >
      <h2 id="notice-title" className="text-lg">
        {t('notice.title')}
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="notice-text" className="text-sm font-medium">
          {t('notice.label')}
        </label>
        {isSample ? (
          <span className="rounded-full bg-warning px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
            {t('notice.sample')}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setText(SAMPLE_NOTICE_TEXT)}
            className="min-h-9 text-sm font-medium text-primary underline underline-offset-4"
          >
            {t('notice.use_sample')}
          </button>
        )}
      </div>
      <textarea
        id="notice-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        required
        placeholder={t('notice.placeholder')}
        className="rounded-xl border border-border bg-card px-3 py-2.5 leading-relaxed placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="ms-auto min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {t('notice.button')}
      </button>
    </form>
  )
}
