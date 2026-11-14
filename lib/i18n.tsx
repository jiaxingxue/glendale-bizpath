'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import stringsJson from '@/data/ui-strings.json'

export const LANGUAGES = ['en', 'hy', 'es', 'ko', 'tl', 'fa'] as const
export type Language = (typeof LANGUAGES)[number]

const RTL_LANGUAGES = new Set<Language>(['fa'])
const STORAGE_KEY = 'bizpath-language'
const strings = stringsJson as Record<string, Record<string, string>>

type Vars = Record<string, string | number>

function translate(lang: Language, key: string, vars?: Vars) {
  const template = strings[lang]?.[key] ?? strings.en?.[key] ?? key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
}

type I18nContextValue = {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, vars?: Vars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null
    if (saved && LANGUAGES.includes(saved)) setLangState(saved)
  }, [])

  useEffect(() => {
    // Languages without translations fall back to English text, so mark the document as English for screen readers.
    const contentLang = strings[lang] ? lang : 'en'
    document.documentElement.lang = contentLang
    document.documentElement.dir = RTL_LANGUAGES.has(contentLang as Language) ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const t = useCallback((key: string, vars?: Vars) => translate(lang, key, vars), [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider')
  return ctx
}

export function useCountLabel() {
  const { t } = useI18n()
  return (n: number) => t(n === 1 ? 'count.one' : 'count.other', { n })
}
