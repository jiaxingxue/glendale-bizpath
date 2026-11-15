'use client'

import { useRef, useState } from 'react'
import { getStage, lifecycleConfig } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { useAsk } from '@/lib/use-ask'
import { visitHref } from '@/lib/visit'
import { AskForm } from '@/components/ask-form'
import { StagePanel } from '@/components/home/stage-panel'
import { AnswerPanel } from '@/components/home/answer-panel'
import { NoticeResult } from '@/components/home/notice-result'
import { AskStatus } from '@/components/home/ask-status'

export function AskHero() {
  const { t, lang } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [question, setQuestion] = useState('')
  const [stageId, setStageId] = useState<string | null>(null)
  const [noticeIsSample, setNoticeIsSample] = useState(false)
  const stage = getStage(stageId ?? undefined)
  const { state: askState, ask: sendQuestion, explain } = useAsk(lang)
  const hasAnswer = askState.status === 'streaming' || askState.status === 'done'

  async function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    await sendQuestion(trimmed)
  }

  async function handleExplainNotice(text: string, isSample: boolean) {
    setNoticeIsSample(isSample)
    await explain(text)
  }

  function askExample(text: string) {
    setQuestion(text)
    void ask(text)
  }

  return (
    <section className="on-brand bg-brand text-brand-foreground" aria-labelledby="hero-title">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pt-10 pb-4 md:px-6 md:pt-16">
        <p className="text-sm font-medium tracking-wide text-accent">{t('hero.welcome')}</p>
        <h1 id="hero-title" className="text-3xl leading-tight text-balance md:text-5xl">
          {t('hero.title')}
        </h1>

        <AskForm id="ask-input" value={question} onChange={setQuestion} onSubmit={() => ask(question)} inputRef={inputRef} />

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
          {stage && <StagePanel stage={stage} onExample={askExample} onExplainNotice={handleExplainNotice} />}
        </div>

        <AskStatus state={askState} />
        {hasAnswer && askState.kind === 'notice' && (
          <NoticeResult answer={askState.answer} streaming={askState.status === 'streaming'} isSample={noticeIsSample} />
        )}
        {hasAnswer && askState.kind === 'question' && (
          <AnswerPanel
            question={askState.question}
            answer={askState.answer}
            streaming={askState.status === 'streaming'}
            visitHref={visitHref({
              type: askState.answer.businessType,
              stage: stageId ?? askState.answer.stage,
              question: askState.answer.englishQuestion || askState.question,
              entries: askState.answer.rows.map((row) => row.requirementId),
            })}
            onFollowUp={ask}
          />
        )}
      </div>
    </section>
  )
}
