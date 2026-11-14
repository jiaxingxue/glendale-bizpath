'use client'

import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { askAssistant, explainNotice } from '@/lib/assistant'
import { getStage, lifecycleConfig } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { StagePanel } from '@/components/home/stage-panel'
import { AnswerPanel } from '@/components/home/answer-panel'

export function AskHero() {
  const { t, lang } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [question, setQuestion] = useState('')
  const [stageId, setStageId] = useState<string | null>(null)
  const [answerVisible, setAnswerVisible] = useState(false)
  const stage = getStage(stageId ?? undefined)

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    setAnswerVisible(true)
    await askAssistant(trimmed, lang)
  }

  async function handleExplainNotice(text: string, image: File | null) {
    setAnswerVisible(true)
    await explainNotice({ text, image, lang })
  }

  function fillExample(text: string) {
    setQuestion(text)
    inputRef.current?.focus()
  }

  return (
    <section className="on-brand bg-brand text-brand-foreground" aria-labelledby="hero-title">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pt-10 pb-4 md:px-6 md:pt-16">
        <p className="text-sm font-medium tracking-wide text-accent">{t('hero.welcome')}</p>
        <h1 id="hero-title" className="text-3xl leading-tight text-balance md:text-5xl">
          {t('hero.title')}
        </h1>

        <form onSubmit={handleAsk} className="flex flex-col gap-3">
          <label htmlFor="ask-input" className="sr-only">
            {t('ask.label')}
          </label>
          <div className="flex flex-col gap-2 rounded-2xl bg-card p-2 sm:flex-row">
            <input
              id="ask-input"
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('ask.placeholder')}
              autoComplete="off"
              aria-describedby="ask-note"
              className="h-14 min-w-0 flex-1 rounded-xl bg-card px-4 text-base text-card-foreground placeholder:text-muted-foreground focus-visible:outline-primary md:text-lg"
            />
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-accent px-7 text-lg font-semibold text-accent-foreground hover:bg-accent/90 focus-visible:outline-primary"
            >
              {t('ask.button')}
              <ArrowRight className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
          <p id="ask-note" className="text-sm leading-relaxed text-brand-muted">
            {t('ask.note')}
          </p>
        </form>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-medium text-brand-foreground">{t('stages.label')}</legend>
          <div className="flex flex-wrap gap-2">
            {lifecycleConfig.stages.map((s) => {
              const selected = s.id === stageId
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="stage-panel"
                  onClick={() => setStageId(selected ? null : s.id)}
                  className={
                    selected
                      ? 'min-h-11 rounded-full border border-accent bg-accent px-4 text-sm font-semibold text-accent-foreground'
                      : 'min-h-11 rounded-full border border-brand-muted/60 px-4 text-sm font-medium text-brand-foreground hover:border-accent hover:bg-brand-ridge'
                  }
                >
                  {t(s.label_key)}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div id="stage-panel" aria-live="polite">
          {stage && <StagePanel stage={stage} onExample={fillExample} onExplainNotice={handleExplainNotice} />}
        </div>

        {answerVisible && <AnswerPanel />}
      </div>
    </section>
  )
}
