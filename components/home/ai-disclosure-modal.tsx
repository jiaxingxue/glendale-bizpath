'use client'

import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const DISMISSED_KEY = 'bizpath-ai-disclosure-dismissed'
const POINTS = ['modal.p1', 'modal.p2', 'modal.p3', 'modal.p4']

export function AiDisclosureModal() {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) dialogRef.current?.showModal()
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="ai-disclosure-title"
      onCancel={(e) => e.preventDefault()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground backdrop:bg-brand/75 md:p-8"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-primary">
            <Bot className="size-5" aria-hidden="true" />
          </span>
          <h2 id="ai-disclosure-title" className="text-xl text-balance">
            {t('modal.title')}
          </h2>
        </div>
        <ul className="flex flex-col gap-2 leading-relaxed">
          {POINTS.map((key) => (
            <li key={key} className="flex gap-2">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={dismiss}
          autoFocus
          className="h-12 rounded-xl bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('modal.continue')}
        </button>
      </div>
    </dialog>
  )
}
