'use client'

import { GemLogo } from '@/components/gem-logo'
import { LangLink } from '@/components/lang-link'
import { useI18n } from '@/lib/i18n'

export function SiteFooter() {
  const { t } = useI18n()
  return (
    <footer className="on-brand bg-brand text-brand-foreground print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <GemLogo className="size-7 text-accent" />
          <span className="font-heading text-lg font-semibold">{t('app.name')}</span>
        </div>
        <nav aria-label={t('footer.nav')} className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <LangLink href="/deadlines" className="underline-offset-4 hover:underline">
            {t('footer.deadlines')}
          </LangLink>
          <LangLink href="/staff" className="underline-offset-4 hover:underline">
            {t('footer.staff')}
          </LangLink>
        </nav>
        <div className="flex flex-col gap-1 text-sm leading-relaxed text-brand-muted md:text-end">
          <p>{t('footer.legal')}</p>
          <p>{t('footer.built')}</p>
        </div>
      </div>
    </footer>
  )
}
