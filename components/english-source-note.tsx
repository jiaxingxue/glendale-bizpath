'use client'

import { Languages } from 'lucide-react'
import { DEFAULT_LANGUAGE, useI18n } from '@/lib/i18n'

/** Shown above requirement content when the UI language is not English. */
export function EnglishSourceNote() {
  const { t, lang } = useI18n()
  if (lang === DEFAULT_LANGUAGE) return null
  return (
    <p className="flex items-start gap-2 rounded-lg bg-secondary px-3 py-2 text-sm leading-relaxed text-secondary-foreground">
      <Languages className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      {t('req.english_note')}
    </p>
  )
}
