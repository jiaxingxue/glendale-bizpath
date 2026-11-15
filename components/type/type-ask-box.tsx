'use client'

import { useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useAsk } from '@/lib/use-ask'
import { visitHref } from '@/lib/visit'
import { AskForm } from '@/components/ask-form'
import { AnswerPanel } from '@/components/home/answer-panel'
import { AskStatus } from '@/components/home/ask-status'

export function TypeAskBox({ typeId, stageId }: { typeId: string; stageId: string | null }) {
  const { t, lang } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [question, setQuestion] = useState('')
  const { state, ask: sendQuestion } = useAsk(lang)

  async function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    await sendQuestion(trimmed)
  }

  return (
    <section aria-labelledby="type-ask-title" className="on-brand bg-brand text-brand-foreground print:hidden">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-12 md:px-6">
        <div className="flex flex-col gap-2">
          <h2 id="type-ask-title" className="text-2xl md:text-3xl">
            {t('type.ask_title')}
          </h2>
          <p className="leading-relaxed text-brand-muted">{t('type.ask_intro')}</p>
        </div>
        <AskForm id="type-ask-input" value={question} onChange={setQuestion} onSubmit={() => ask(question)} inputRef={inputRef} />
        <AskStatus state={state} />
        {(state.status === 'streaming' || state.status === 'done') && (
          <AnswerPanel
            question={state.question}
            answer={state.answer}
            streaming={state.status === 'streaming'}
            visitHref={visitHref({
              type: typeId,
              stage: stageId,
              question: state.answer.englishQuestion || state.question,
              entries: state.answer.rows.map((row) => row.requirementId),
            })}
            onFollowUp={ask}
          />
        )}
      </div>
    </section>
  )
}
