'use client'

import { CircleCheck, CircleDashed } from 'lucide-react'
import { coverageFor } from '@/lib/data'
import { useI18n } from '@/lib/i18n'

export function CoverageBadge({ typeId }: { typeId: string }) {
  const { t } = useI18n()
  const verified = coverageFor(typeId) === 'verified'
  const Icon = verified ? CircleCheck : CircleDashed
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        verified ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'
      }`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {t(verified ? 'coverage.verified' : 'coverage.baseline')}
    </span>
  )
}
