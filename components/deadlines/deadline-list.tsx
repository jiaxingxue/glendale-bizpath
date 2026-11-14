'use client'

import { CalendarClock, ChevronRight } from 'lucide-react'
import { corpus, groupByStage, type Requirement } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { LangLink } from '@/components/lang-link'
import { EnglishSourceNote } from '@/components/english-source-note'

const ALL_TYPES = 'all'
const GENERAL_TYPE = 'other'

function requirementHref(req: Requirement, stageId: string) {
  const typeId = req.business_types.find((id) => id !== ALL_TYPES) ?? GENERAL_TYPE
  return `/type/${typeId}?stage=${stageId}#req-${req.id}`
}

export function DeadlineList() {
  const { t } = useI18n()
  const groups = groupByStage(
    [...corpus].filter((req) => req.deadlines.length > 0).sort((a, b) => a.order - b.order),
  )

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl leading-tight text-balance md:text-4xl">{t('deadlines.title')}</h1>
        <p className="leading-relaxed text-muted-foreground text-pretty">{t('deadlines.intro')}</p>
      </header>

      <EnglishSourceNote />

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">{t('deadlines.empty')}</p>
      ) : (
        groups.map(({ stage, requirements }) => (
          <section key={stage.id} aria-labelledby={`deadlines-${stage.id}`} className="flex flex-col gap-3">
            <h2 id={`deadlines-${stage.id}`} className="text-xl">{t(stage.label_key)}</h2>
            <ul className="flex flex-col gap-3">
              {requirements.map((req) => (
                <li key={req.id}>
                  <LangLink
                    href={requirementHref(req, stage.id)}
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <div className="flex flex-col gap-2" lang="en">
                      <span className="font-heading text-lg font-semibold text-balance">{req.title}</span>
                      <ul className="flex flex-col gap-1.5">
                        {req.deadlines.map((deadline) => (
                          <li key={deadline} className="flex items-start gap-2 text-sm leading-relaxed">
                            <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                            {deadline}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 pt-1 text-sm font-semibold text-primary">
                      <span className="hidden sm:inline">{t('deadlines.open')}</span>
                      <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                    </span>
                  </LangLink>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
