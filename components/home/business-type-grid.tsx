'use client'

import Link from 'next/link'
import { lifecycleConfig, requirementsForType } from '@/lib/data'
import { useCountLabel, useI18n } from '@/lib/i18n'
import { BusinessTypeIcon } from '@/components/business-type-icon'
import { CoverageBadge } from '@/components/coverage-badge'

export function BusinessTypeGrid() {
  const { t } = useI18n()
  const countLabel = useCountLabel()

  return (
    <section aria-labelledby="browse-title" className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:px-6 md:py-16">
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 id="browse-title" className="text-2xl md:text-3xl">
          {t('browse.title')}
        </h2>
        <p className="leading-relaxed text-muted-foreground text-pretty">{t('browse.intro')}</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lifecycleConfig.business_types.map((type) => (
          <li key={type.id}>
            <Link
              href={`/type/${type.id}`}
              className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-primary">
                  <BusinessTypeIcon id={type.id} className="size-6" />
                </span>
                <CoverageBadge typeId={type.id} />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-lg group-hover:text-primary">{t(type.label_key)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(type.sub_key)}</p>
              </div>
              <p className="text-sm font-medium text-primary">{countLabel(requirementsForType(type.id).length)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
