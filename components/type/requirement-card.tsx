'use client'

import { CalendarClock, ChevronDown, ExternalLink, Scale } from 'lucide-react'
import type { Requirement } from '@/lib/data'
import { handleFeedback } from '@/lib/feedback'
import { useI18n } from '@/lib/i18n'
import { ContactDetails } from '@/components/contact-details'
import { FeedbackControl } from '@/components/feedback-control'

type RequirementCardProps = {
  requirement: Requirement
  headingLevel?: 3 | 4
  showFeedback?: boolean
}

export function RequirementCard({ requirement: req, headingLevel = 4, showFeedback = true }: RequirementCardProps) {
  const { t } = useI18n()
  const Heading = headingLevel === 3 ? 'h3' : 'h4'
  const titleId = `req-${req.id}`

  return (
    <article
      lang="en"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 text-card-foreground md:p-6"
      aria-labelledby={titleId}
    >
      <header className="flex flex-col gap-2">
        <Heading id={titleId} className="text-xl text-balance">
          {req.title}
        </Heading>
        {req.summary && <p className="leading-relaxed text-muted-foreground text-pretty">{req.summary}</p>}
      </header>

      <dl className="grid gap-4 rounded-xl border border-border p-4 text-sm leading-relaxed sm:grid-cols-3">
        <Field label={t('req.fee')}>{req.fee || '—'}</Field>
        <Field label={t('req.documents')}>
          {req.documents.length > 0 ? (
            <ul className="list-disc ps-4">
              {req.documents.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          ) : (
            '—'
          )}
        </Field>
        <Field label={t('req.issuer')}>{req.issuer || '—'}</Field>
      </dl>

      {req.deadlines.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">{t('req.deadlines')}</p>
          <ul className="flex flex-wrap gap-2">
            {req.deadlines.map((deadline) => (
              <li
                key={deadline}
                className="inline-flex items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-xs font-medium text-warning-foreground"
              >
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {deadline}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-xl bg-muted p-4">
        <p className="text-sm font-medium text-muted-foreground">{t('req.contact')}</p>
        <p className="font-medium">{req.contact.desk}</p>
        <ContactDetails contact={req.contact} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
        {req.code && (
          <LawLink code={req.code} url={req.law_url} />
        )}
      </div>

      {req.applies_because && (
        <details className="group rounded-xl border border-border">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
            {t('req.why')}
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="px-4 pb-4 text-sm leading-relaxed">{req.applies_because}</p>
        </details>
      )}

      <footer className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {req.verified ? t('req.last_verified', { date: req.verified }) : t('req.never_verified')}
          {req.url && (
            <>
              {' · '}
              <a
                href={req.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4"
              >
                {t('req.city_source')}
              </a>
            </>
          )}
        </p>
        {showFeedback && <FeedbackControl target={`requirement:${req.id}`} onSubmit={handleFeedback} />}
      </footer>
    </article>
  )
}

export function LawLink({ code, url }: { code: string; url: string }) {
  const { t } = useI18n()
  const content = (
    <>
      <Scale className="size-4 shrink-0" aria-hidden="true" />
      <span>
        {t('req.law')}
        <span className="ms-1.5 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground">{code}</span>
      </span>
    </>
  )
  if (!url) return <span className="inline-flex items-center gap-2 text-sm font-medium">{content}</span>
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
    >
      {content}
    </a>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
