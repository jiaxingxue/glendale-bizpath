'use client'

import { ArrowLeft, ClipboardList, ExternalLink, TriangleAlert } from 'lucide-react'
import { getBusinessType, groupByStage, isLinkOnly, lifecycleConfig, permitCenter, requirementsForType } from '@/lib/data'
import { useCountLabel, useI18n } from '@/lib/i18n'
import { visitHref } from '@/lib/visit'
import { BusinessTypeIcon } from '@/components/business-type-icon'
import { CoverageBadge } from '@/components/coverage-badge'
import { EnglishSourceNote } from '@/components/english-source-note'
import { LangLink } from '@/components/lang-link'
import { Ridgeline } from '@/components/ridgeline'
import { TalkToPerson } from '@/components/talk-to-person'
import { RequirementCard } from '@/components/type/requirement-card'
import { TypeAskBox } from '@/components/type/type-ask-box'

export function TypeGuide({ typeId, stageId }: { typeId: string; stageId: string | null }) {
  const { t } = useI18n()
  const countLabel = useCountLabel()
  const type = getBusinessType(typeId)
  if (!type) return null

  const requirements = requirementsForType(typeId, stageId ?? undefined)
  const verified = requirements.filter((req) => !isLinkOnly(req))
  const linkOnly = requirements.filter(isLinkOnly)
  const groups = groupByStage(verified, stageId ?? undefined)

  const filters: { id: string | null; label: string }[] = [
    { id: null, label: t('type.all_stages') },
    ...lifecycleConfig.stages.map((s) => ({ id: s.id, label: t(s.label_key) })),
  ]

  let stepNumber = 0

  return (
    <>
      <section className="on-brand bg-brand text-brand-foreground" aria-labelledby="type-title">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 pt-8 md:px-6 md:pt-12">
          <LangLink
            href="/#browse-title"
            className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-brand-muted underline-offset-4 hover:text-brand-foreground hover:underline"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            {t('type.back')}
          </LangLink>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-ridge text-accent">
                <BusinessTypeIcon id={type.id} className="size-7" />
              </span>
              <div className="flex flex-col gap-1">
                <h1 id="type-title" className="text-3xl leading-tight text-balance md:text-4xl">
                  {t(type.label_key)}
                </h1>
                <p className="text-brand-muted">{t(type.sub_key)}</p>
              </div>
            </div>
            <LangLink
              href={visitHref({ type: type.id, stage: stageId })}
              className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
            >
              <ClipboardList className="size-4" aria-hidden="true" />
              {t('type.prepare')}
            </LangLink>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CoverageBadge typeId={type.id} />
            <span className="text-sm text-brand-muted">{countLabel(requirementsForType(type.id).length)}</span>
          </div>
        </div>
      </section>
      <Ridgeline />

      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-6">
        <nav aria-labelledby="stage-filter-label" className="flex flex-col gap-3">
          <h2 id="stage-filter-label" className="text-sm font-sans font-medium text-muted-foreground">
            {t('type.filter')}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const active = f.id === stageId
              return (
                <li key={f.id ?? 'all'}>
                  <LangLink
                    href={f.id ? `/type/${type.id}?stage=${f.id}` : `/type/${type.id}`}
                    aria-current={active ? 'page' : undefined}
                    scroll={false}
                    className={
                      active
                        ? 'inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground'
                        : 'inline-flex min-h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-medium hover:border-primary'
                    }
                  >
                    {f.label}
                  </LangLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <section aria-labelledby="steps-title" className="flex flex-col gap-6">
          <h2 id="steps-title" className="text-2xl">
            {t('type.steps')}
          </h2>
          <EnglishSourceNote />

          {groups.length === 0 && linkOnly.length === 0 && (
            <p className="rounded-xl border border-border bg-card p-5 leading-relaxed text-muted-foreground">{t('type.empty')}</p>
          )}

          {groups.map((group) => (
            <section key={group.stage.id} aria-labelledby={`stage-${group.stage.id}`} className="flex flex-col gap-4">
              <h3 id={`stage-${group.stage.id}`} className="text-lg text-primary">
                {t(group.stage.label_key)}
              </h3>
              <ol className="flex flex-col">
                {group.requirements.map((req, i) => {
                  stepNumber += 1
                  const isLast = i === group.requirements.length - 1
                  return (
                    <li key={req.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-brand-foreground"
                          aria-label={t('type.step', { n: stepNumber })}
                        >
                          {stepNumber}
                        </span>
                        {!isLast && <span className="w-0.5 flex-1 bg-border" aria-hidden="true" />}
                      </div>
                      <div className={isLast ? 'min-w-0 flex-1' : 'min-w-0 flex-1 pb-6'}>
                        <RequirementCard
                          requirement={req}
                          headingLevel={4}
                          feedbackContext={{ business_type: type.id, stage: group.stage.id }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}

          {linkOnly.length > 0 && (
            <section
              aria-labelledby="unverified-title"
              className="flex flex-col gap-3 rounded-2xl border border-warning bg-warning/15 p-5"
            >
              <h3 id="unverified-title" className="flex items-center gap-2 text-lg">
                <TriangleAlert className="size-5 text-warning-foreground" aria-hidden="true" />
                {t('type.unverified_title')}
              </h3>
              <p className="text-sm leading-relaxed">{t('type.unverified_intro')}</p>
              <ul className="flex flex-col divide-y divide-warning/40" lang="en">
                {linkOnly.map((req) => (
                  <li key={req.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold">{req.title}</span>
                      <span className="text-sm text-muted-foreground">{req.issuer}</span>
                    </div>
                    {req.url && (
                      <a
                        href={req.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-primary underline underline-offset-4"
                      >
                        {t('req.official')}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>

        <TalkToPerson contact={permitCenter} headingLevel={2} />
      </div>

      <TypeAskBox typeId={type.id} stageId={stageId} />
    </>
  )
}
