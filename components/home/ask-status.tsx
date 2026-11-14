'use client'

import { Loader2 } from 'lucide-react'
import type { AskState } from '@/lib/use-ask'
import { useI18n } from '@/lib/i18n'
import { permitCenter } from '@/lib/data'
import { TalkToPerson } from '@/components/talk-to-person'

/** Loading and error states shown before an answer panel exists. */
export function AskStatus({ state }: { state: AskState }) {
  const { t } = useI18n()
  if (state.status === 'loading') {
    return (
      <p role="status" className="flex items-center gap-2 rounded-2xl border border-border bg-card p-5 text-card-foreground">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
        {t('answer.loading')}
      </p>
    )
  }
  if (state.status === 'error') {
    return (
      <div role="alert" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground">
        <p>{t('answer.error')}</p>
        <TalkToPerson contact={permitCenter} headingLevel={3} />
      </div>
    )
  }
  return null
}
