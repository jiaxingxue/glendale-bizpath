'use client'

import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

type KpiCardProps = { label: string; value: string | null; highlight?: boolean }

export function KpiCard({ label, value, highlight = false }: KpiCardProps) {
  const { t } = useI18n()
  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-4 rounded-2xl border p-5',
        highlight ? 'border-warning-foreground/30 bg-warning text-warning-foreground' : 'border-border bg-card text-card-foreground',
      )}
    >
      <p className={cn('text-sm leading-relaxed', !highlight && 'text-muted-foreground')}>{label}</p>
      {value === null ? (
        <p className="text-sm font-medium text-muted-foreground">{t('staff.no_data')}</p>
      ) : (
        <p className="font-heading text-4xl font-semibold tabular-nums leading-none">{value}</p>
      )}
    </div>
  )
}
