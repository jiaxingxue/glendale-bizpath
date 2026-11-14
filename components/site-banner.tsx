'use client'

import { useI18n } from '@/lib/i18n'

export function SiteBanner() {
  const { t } = useI18n()
  return (
    <div className="bg-accent px-4 py-2 text-center text-sm font-medium text-accent-foreground print:hidden" role="note">
      {t('banner')}
    </div>
  )
}
