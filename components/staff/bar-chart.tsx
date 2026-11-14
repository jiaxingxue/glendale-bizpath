'use client'

import { useI18n } from '@/lib/i18n'

type BarChartProps = { title: string; rows: { label: string; count: number }[] }

export function BarChart({ title, rows }: BarChartProps) {
  const { t } = useI18n()
  const max = Math.max(1, ...rows.map((row) => row.count))

  return (
    <figure className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-card-foreground">
      <figcaption className="text-sm text-muted-foreground">
        {t('staff.charts')} <span className="font-semibold text-foreground">{title.toLowerCase()}</span>
      </figcaption>
      {rows.length === 0 ? (
        <p className="rounded-xl bg-secondary px-4 py-6 text-center text-sm text-muted-foreground">{t('staff.no_data')}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li key={row.label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{row.label}</span>
                <span className="tabular-nums text-muted-foreground">{row.count}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary" aria-hidden="true">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(row.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
