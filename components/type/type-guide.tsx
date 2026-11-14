'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getBusinessType, lifecycleConfig, requirementsForType } from '@/lib/data'
import { useCountLabel, useI18n } from '@/lib/i18n'
import { BusinessTypeIcon } from '@/components/business-type-icon'
import { CoverageBadge } from '@/components/coverage-badge'
import { Ridgeline } from '@/components/ridgeline'
import { RequirementCard } from '@/components/type/requirement-card'

export function TypeGuide({ typeId, stageId }: { typeId: string; stageId: string | null }) {
  const { t } = useI18n()
  const countLabel = useCountLabel()
  const type = getBusinessType(typeId)
  if (!type) return null
  const requirements = requirementsForType(typeId, stageId ?? undefined)

  const filters: { id: string | null; label: string }[] = [
    { id: null, label: t('type.all_stages') },
    ...lifecycleConfig.stages.map((s) => ({ id: s.id, label: t(s.label_key) })),
  ]

  return (
    <>
      <section className="on-brand bg-brand text-brand-foreground" aria-labelledby="type-title">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 pt-8 md:px-6 md:pt-12">
          <Link
            href="/#browse-title"
            className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-brand-muted underline-offset-4 hover:text-brand-foreground hover:underline"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            {t('type.back')}
          </Link>
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
          <div className="flex flex-wrap items-center gap-3">
            <CoverageBadge typeId={type.id} />
            <span className="text-sm text-brand-muted">{countLabel(requirementsForType(type.id).length)}</span>
          </div>
          <p className="max-w-2xl leading-relaxed text-brand-muted">{t('type.intro')}</p>
        </div>
      </section>
      <Ridgeline />

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 md:px-6">
        <nav aria-labelledby="stage-filter-label" className="flex flex-col gap-3">
          <h2 id="stage-filter-label" className="text-sm font-sans font-medium text-muted-foreground">
            {t('type.filter')}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const active = f.id === stageId
              return (
                <li key={f.id ?? 'all'}>
                  <Link
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
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <section aria-labelledby="steps-title" className="flex flex-col gap-4">
          <h2 id="steps-title" className="text-2xl">
            {t('type.steps')}
          </h2>
          {requirements.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-5 text-muted-foreground">{t('type.empty')}</p>
          ) : (
            <ol className="flex flex-col gap-4">
              {requirements.map((req, index) => (
                <li key={req.id}>
                  <RequirementCard requirement={req} step={index + 1} />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}
