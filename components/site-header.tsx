'use client'

import { Globe } from 'lucide-react'
import { GemLogo } from '@/components/gem-logo'
import { LangLink } from '@/components/lang-link'
import { LANGUAGES, type Language, useI18n } from '@/lib/i18n'

export function SiteHeader() {
  const { lang, setLang, t } = useI18n()

  return (
    <header className="on-brand bg-brand text-brand-foreground print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <LangLink href="/" className="flex min-w-0 items-center gap-3 rounded-md" aria-label={t('app.home')}>
          <GemLogo className="size-9 shrink-0 text-accent" />
          <span className="flex min-w-0 flex-col">
            <span className="font-heading text-xl font-semibold leading-tight tracking-wide md:text-2xl">
              {t('app.name')}
            </span>
            <span className="hidden text-xs leading-snug text-brand-muted sm:block">{t('app.subtitle')}</span>
          </span>
        </LangLink>

        <div className="flex shrink-0 items-center gap-2">
          <Globe className="size-4 text-brand-muted" aria-hidden="true" />
          <label htmlFor="language-select" className="sr-only">
            {t('lang.label')}
          </label>
          <select
            id="language-select"
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="h-10 rounded-lg border border-brand-muted/60 bg-brand px-2 text-sm text-brand-foreground"
          >
            {LANGUAGES.map((code) => (
              <option key={code} value={code} lang={code}>
                {t(`lang.${code}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
