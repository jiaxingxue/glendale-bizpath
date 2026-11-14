'use client'

import useSWR from 'swr'
import { Download, ExternalLink } from 'lucide-react'
import type { FeedbackStore } from '@/lib/feedback'
import { lifecycleConfig } from '@/lib/data'
import { computeStaffStats, requirementFromTarget, type Count, type ReviewEntry } from '@/lib/staff-stats'
import { useI18n } from '@/lib/i18n'
import { KpiCard } from '@/components/staff/kpi-card'
import { DataTable } from '@/components/staff/data-table'
import { BarChart } from '@/components/staff/bar-chart'

const fetchJson = async (url: string): Promise<FeedbackStore> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

function SourceLink({ url }: { url: string }) {
  const { t } = useI18n()
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary underline underline-offset-4"
    >
      {t('staff.source_link')}
      <ExternalLink className="size-3.5" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

export function StaffDashboard({ needsReview }: { needsReview: ReviewEntry[] }) {
  const { t } = useI18n()
  const { data, error, isLoading } = useSWR('/api/feedback', fetchJson)
  const stats = data ? computeStaffStats(data) : null
  const hasQuestions = (stats?.questionsAsked ?? 0) > 0

  const typeLabel = (id: string) => {
    const type = lifecycleConfig.business_types.find((item) => item.id === id)
    return type ? t(type.label_key) : t('staff.unknown')
  }
  const stageLabel = (id: string) => {
    const stage = lifecycleConfig.stages.find((item) => item.id === id)
    return stage ? t(stage.label_key) : t('staff.unknown')
  }
  const languageLabel = (code: string) => (code === 'unknown' ? t('staff.unknown') : t(`lang.${code}`))
  const label = (fn: (key: string) => string) => (rows: Count[]) => rows.map((row) => ({ label: fn(row.key), count: row.count }))

  const status = isLoading ? t('staff.loading') : error ? t('staff.error') : null
  const metric = (value: number | null | undefined, suffix = '') =>
    !stats || value === null || value === undefined || !hasQuestions ? null : `${value}${suffix}`

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl leading-tight text-balance md:text-4xl">{t('staff.title')}</h1>
          <p className="max-w-2xl leading-relaxed text-muted-foreground text-pretty">{t('staff.intro')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/llms.txt"
            download="llms.txt"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Download className="size-4" aria-hidden="true" />
            {t('staff.download_llms')}
          </a>
          <a
            href="/corpus.json"
            download="corpus.json"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary px-5 text-sm font-semibold text-primary hover:bg-secondary"
          >
            <Download className="size-4" aria-hidden="true" />
            {t('staff.download_corpus')}
          </a>
        </div>
      </header>

      {status && (
        <p role="status" className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {status}
        </p>
      )}

      <section aria-labelledby="staff-liability" className="flex flex-col gap-4">
        <h2 id="staff-liability" className="text-xl">{t('staff.liability')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label={t('staff.kpi.verified')} value={metric(stats?.verifiedSourceRate, '%')} />
          <KpiCard label={t('staff.kpi.declined')} value={metric(stats?.legalAdviceDeclined)} />
          <KpiCard label={t('staff.kpi.handoff')} value={metric(stats?.handedOff)} />
          <KpiCard label={t('staff.kpi.review')} value={String(needsReview.length)} highlight={needsReview.length > 0} />
        </div>
      </section>

      <section aria-labelledby="staff-usage" className="flex flex-col gap-4">
        <h2 id="staff-usage" className="text-xl">{t('staff.usage')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label={t('staff.kpi.questions')} value={metric(stats?.questionsAsked)} />
          <KpiCard
            label={t('staff.kpi.thumbs')}
            value={stats && stats.thumbsUpRate !== null ? `${stats.thumbsUpRate}%` : null}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <BarChart title={t('staff.chart.language')} rows={label(languageLabel)(stats?.byLanguage ?? [])} />
          <BarChart title={t('staff.chart.type')} rows={label(typeLabel)(stats?.byBusinessType ?? [])} />
          <BarChart title={t('staff.chart.stage')} rows={label(stageLabel)(stats?.byStage ?? [])} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable
          title={t('staff.top')}
          columns={[t('staff.col.question'), t('staff.col.language'), t('staff.col.count')]}
          rows={(stats?.topQuestions ?? []).map((row) => ({
            key: `${row.question}-${row.lang}`,
            cells: [
              <span key="q" lang="en">{row.question}</span>,
              <span key="l" className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs uppercase">{row.lang}</span>,
              row.count,
            ],
          }))}
        />
        <DataTable
          title={t('staff.gaps')}
          hint={t('staff.gaps_hint')}
          columns={[t('staff.col.question'), t('staff.col.count')]}
          rows={(stats?.contentGaps ?? []).map((row) => ({
            key: row.key,
            cells: [<span key="q" lang="en">{row.key}</span>, row.count],
          }))}
        />
        <DataTable
          title={t('staff.hard')}
          columns={[t('staff.col.requirement'), t('staff.col.hard_count')]}
          rows={(stats?.hardToUnderstand ?? []).map((row) => ({
            key: row.key,
            cells: [<span key="r" lang="en">{requirementFromTarget(row.key)?.title ?? row.key}</span>, row.count],
          }))}
        />
        <DataTable
          title={t('staff.flagged')}
          columns={[t('staff.col.requirement'), t('staff.col.reason'), t('staff.col.count'), t('staff.col.source')]}
          rows={(stats?.flagged ?? []).map((row) => {
            const req = requirementFromTarget(row.target)
            return {
              key: `${row.target}-${row.reason}`,
              cells: [
                <span key="r" lang="en">{req?.title ?? row.target}</span>,
                t(row.reason),
                row.count,
                req ? <SourceLink key="s" url={req.url} /> : '—',
              ],
            }
          })}
        />
      </div>

      <DataTable
        title={t('staff.review')}
        hint={t('staff.review_hint')}
        columns={[t('staff.col.requirement'), t('staff.col.verified'), t('staff.col.source')]}
        rows={needsReview.map((entry) => ({
          key: entry.id,
          cells: [
            <span key="r" lang="en">{entry.title}</span>,
            entry.daysSince === null ? (
              <span key="v" className="font-medium text-warning-foreground">{t('staff.never')}</span>
            ) : (
              <span key="v">
                {entry.verified} · {t('staff.days_ago', { n: entry.daysSince })}
              </span>
            ),
            <SourceLink key="s" url={entry.url} />,
          ],
        }))}
      />
    </div>
  )
}
