'use client'

import { useEffect, useRef } from 'react'
import { Mail, Printer, Square } from 'lucide-react'
import { corpus, getBusinessType, getStage, isLinkOnly, permitCenter, requirementsForType } from '@/lib/data'
import { recordHandoff } from '@/lib/feedback'
import { useI18n } from '@/lib/i18n'
import { EnglishSourceNote } from '@/components/english-source-note'

type VisitSheetProps = {
  typeId: string | null
  stageId: string | null
  question: string | null
  /** Entries from the answer the sheet was opened from; empty means use the business type and stage. */
  entryIds: string[]
}

export function VisitSheet({ typeId, stageId, question, entryIds }: VisitSheetProps) {
  const { t, lang } = useI18n()
  const logged = useRef(false)

  // Opening the sheet is a hand-off to City staff; log it once per page view.
  useEffect(() => {
    if (logged.current) return
    logged.current = true
    recordHandoff({ kind: 'visit', language: lang, business_type: typeId, stage: stageId, time: new Date().toISOString() })
  }, [lang, typeId, stageId])

  const type = typeId ? getBusinessType(typeId) : undefined
  const stage = getStage(stageId ?? undefined)
  const source =
    entryIds.length > 0
      ? corpus.filter((req) => entryIds.includes(req.id))
      : requirementsForType(typeId ?? 'other', stageId ?? undefined)
  const requirements = source.filter((req) => !isLinkOnly(req))
  const documents = Array.from(new Set(requirements.flatMap((req) => req.documents)))
  const fees = requirements.filter((req) => req.fee)

  const typeLabel = type ? t(type.label_key) : t('visit.none')
  const stageLabel = stage ? t(stage.label_key) : t('visit.none')

  const emailBody = [
    t('visit.title'),
    '',
    `${t('visit.type')}: ${typeLabel}`,
    `${t('visit.stage')}: ${stageLabel}`,
    `${t('visit.question')}: ${question ?? t('visit.none')}`,
    '',
    `${t('visit.documents')}:`,
    ...documents.map((doc) => `[ ] ${doc}`),
    '',
    `${t('visit.fees')}:`,
    ...fees.map((req) => `- ${req.title}: ${req.fee}`),
    '',
    `${permitCenter.desk}`,
    permitCenter.address,
    permitCenter.hours,
    permitCenter.phone,
    '',
    t('legal.short'),
  ].join('\n')
  const mailto = `mailto:?subject=${encodeURIComponent(t('visit.email_subject'))}&body=${encodeURIComponent(emailBody)}`

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 md:px-6 print:max-w-none print:p-0">
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Printer className="size-4" aria-hidden="true" />
          {t('visit.print')}
        </button>
        <a
          href={mailto}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary px-5 text-sm font-semibold text-primary hover:bg-secondary"
        >
          <Mail className="size-4" aria-hidden="true" />
          {t('visit.email')}
        </a>
      </div>

      <article
        aria-labelledby="visit-title"
        className="flex flex-col gap-7 rounded-2xl border border-border bg-card p-6 text-card-foreground md:p-10 print:rounded-none print:border-0 print:p-0"
      >
        <h1 id="visit-title" className="text-3xl leading-tight text-balance">
          {t('visit.title')}
        </h1>

        <section aria-labelledby="visit-situation" className="flex flex-col gap-3">
          <h2 id="visit-situation" className="text-lg">{t('visit.situation')}</h2>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
            <dt className="text-sm text-muted-foreground">{t('visit.type')}</dt>
            <dd className="font-medium">{typeLabel}</dd>
            <dt className="text-sm text-muted-foreground">{t('visit.stage')}</dt>
            <dd className="font-medium">{stageLabel}</dd>
            <dt className="text-sm text-muted-foreground">{t('visit.question')}</dt>
            <dd className="font-medium leading-relaxed">{question ?? t('visit.none')}</dd>
          </dl>
        </section>

        <EnglishSourceNote />

        <section aria-labelledby="visit-documents" className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 id="visit-documents" className="text-lg">{t('visit.documents')}</h2>
          {documents.length === 0 && <p className="text-muted-foreground">{t('visit.no_documents')}</p>}
          <ul className="flex flex-col gap-2" lang="en">
            {documents.map((doc) => (
              <li key={doc} className="flex items-start gap-3 leading-relaxed">
                <Square className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                {doc}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="visit-fees" className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 id="visit-fees" className="text-lg">{t('visit.fees')}</h2>
          {fees.length === 0 ? (
            <p className="text-muted-foreground">{t('visit.no_fees')}</p>
          ) : (
            <table className="w-full text-sm" lang="en">
              <tbody>
                {fees.map((req) => (
                  <tr key={req.id} className="border-b border-border last:border-0">
                    <th scope="row" className="py-2 pe-4 text-start font-medium">{req.title}</th>
                    <td className="py-2 text-end">{req.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section aria-labelledby="visit-where" className="flex flex-col gap-2 border-t border-border pt-6">
          <h2 id="visit-where" className="text-lg">{t('visit.where')}</h2>
          <address className="flex flex-col gap-1 not-italic leading-relaxed" lang="en">
            <span className="font-semibold">{permitCenter.desk}</span>
            <span>{permitCenter.address}</span>
            <span>{permitCenter.hours}</span>
            <a href={`tel:${permitCenter.phone.replace(/[^\d+]/g, '')}`} className="w-fit text-primary underline underline-offset-4">
              {permitCenter.phone}
            </a>
          </address>
        </section>

        <section aria-labelledby="visit-open" className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 id="visit-open" className="text-lg">{t('visit.open_questions')}</h2>
          <p className="text-sm text-muted-foreground print:hidden">{t('visit.open_hint')}</p>
          <ul className="flex flex-col gap-4" aria-hidden="true">
            {question && <li className="leading-relaxed">{question}</li>}
            <li className="h-6 border-b border-dashed border-border" />
            <li className="h-6 border-b border-dashed border-border" />
            <li className="h-6 border-b border-dashed border-border" />
          </ul>
        </section>

        <p className="border-t border-border pt-6 text-sm font-medium">{t('legal.short')}</p>
      </article>
    </div>
  )
}
