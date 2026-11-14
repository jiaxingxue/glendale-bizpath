'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import stringsJson from '@/data/ui-strings.json'

export const LANGUAGES = ['en', 'hy', 'es', 'ko', 'tl', 'fa'] as const
export type Language = (typeof LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'en'
export const LANG_PARAM = 'lang'

const RTL_LANGUAGES = new Set<Language>(['fa'])
const STORAGE_KEY = 'bizpath-language'
const strings = stringsJson as Record<string, Record<string, string>>

type Vars = Record<string, string | number>

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}

/** Turns a missing key like "type.all_stages" into "All stages" so users never see raw keys. */
function readableDefault(key: string) {
  const last = key.split('.').pop() ?? key
  const words = last.replace(/[_-]+/g, ' ').trim()
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : ''
}

function translate(lang: Language, key: string, vars?: Vars) {
  const template = strings[lang]?.[key] ?? strings[DEFAULT_LANGUAGE]?.[key]
  if (template === undefined && process.env.NODE_ENV !== 'production') {
    console.warn(`[i18n] Missing string "${key}"`)
  }
  const text = template ?? readableDefault(key)
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
}

/** Adds the current language to an internal href so it survives navigation and sharing. */
export function withLang(href: string, lang: Language) {
  const [pathAndQuery, hash] = href.split('#')
  const url = new URL(pathAndQuery || '/', 'http://local')
  if (lang === DEFAULT_LANGUAGE) url.searchParams.delete(LANG_PARAM)
  else url.searchParams.set(LANG_PARAM, lang)
  const query = url.searchParams.toString()
  return `${url.pathname}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
}

type I18nContextValue = {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, vars?: Vars) => string
  href: (path: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE)

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(LANG_PARAM)
    const saved = localStorage.getItem(STORAGE_KEY)
    const initial = isLanguage(fromUrl) ? fromUrl : isLanguage(saved) ? saved : DEFAULT_LANGUAGE
    setLangState(initial)
    localStorage.setItem(STORAGE_KEY, initial)
  }, [])

  useEffect(() => {
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const next = withLang(current, lang)
    if (next !== current) window.history.replaceState(window.history.state, '', next)
  }, [lang, pathname])

  useEffect(() => {
    // Languages without translations fall back to English text, so mark the document as English for screen readers.
    const contentLang = strings[lang] ? lang : DEFAULT_LANGUAGE
    document.documentElement.lang = contentLang
    document.documentElement.dir = RTL_LANGUAGES.has(contentLang as Language) ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const t = useCallback((key: string, vars?: Vars) => translate(lang, key, vars), [lang])
  const href = useCallback((path: string) => withLang(path, lang), [lang])

  const value = useMemo(() => ({ lang, setLang, t, href }), [lang, setLang, t, href])

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
