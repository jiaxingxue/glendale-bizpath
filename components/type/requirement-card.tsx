'use client'

import { ExternalLink, Scale } from 'lucide-react'
import type { Requirement } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { ContactDetails } from '@/components/contact-details'

export function RequirementCard({ requirement: req, step }: { requirement: Requirement; step: number }) {
  const { t } = useI18n()

  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 md:p-6" aria-labelledby={`req-${req.id}`}>
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-brand px-2.5 py-1 text-brand-foreground">{t('type.step', { n: step })}</span>
          <span
            className={`rounded-full px-2.5 py-1 ${
              req.verified ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'
            }`}
          >
            {req.verified ? t('req.verified', { date: req.verified }) : t('req.unverified')}
          </span>
          {req.confidence && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              {t('req.confidence', { value: req.confidence })}
            </span>
          )}
        </div>
        <h3 id={`req-${req.id}`} className="text-xl text-balance">
          {req.title}
        </h3>
        <p className="leading-relaxed text-muted-foreground">{req.summary}</p>
      </header>

      <dl className="grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
        <Field label={t('req.issuer')} value={req.issuer} />
        <Field label={t('req.fee')} value={req.fee} />
        {req.applies_because && <Field label={t('req.why')} value={req.applies_because} wide />}
        {req.documents.length > 0 && <ListField label={t('req.documents')} items={req.documents} />}
        {req.deadlines.length > 0 && <ListField label={t('req.deadlines')} items={req.deadlines} />}
      </dl>

      <div className="flex flex-col gap-2 rounded-xl bg-muted p-4">
        <h4 className="font-heading font-semibold">{t('req.contact')}</h4>
        <p className="text-sm font-medium">{req.contact.desk}</p>
        <ContactDetails contact={req.contact} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {req.apply_url && (
          <a
            href={req.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t('req.apply')}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        )}
        {req.url && (
          <a
            href={req.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-primary underline underline-offset-4"
          >
            {t('req.source')}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        )}
        {req.law_url && (
          <a
            href={req.law_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-primary underline underline-offset-4"
          >
            <Scale className="size-4" aria-hidden="true" />
            {t('req.law')}
            {req.code && `: ${req.code}`}
          </a>
        )}
      </div>
    </article>
  )
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  if (!value) return null
  return (
    <div className={`flex flex-col gap-0.5 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd>
        <ul className="list-disc ps-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </dd>
    </div>
  )
}
