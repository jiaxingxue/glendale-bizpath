'use client'

import { useRef, useState } from 'react'
import { askAssistant, type AssistantAnswer } from '@/lib/assistant'
import { useI18n } from '@/lib/i18n'
import { visitHref } from '@/lib/visit'
import { AskForm } from '@/components/ask-form'
import { AnswerPanel } from '@/components/home/answer-panel'

export function TypeAskBox({ typeId, stageId }: { typeId: string; stageId: string | null }) {
  const { t, lang } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<{ question: string; answer: AssistantAnswer } | null>(null)

  async function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    setResult({ question: trimmed, answer: await askAssistant(trimmed, lang) })
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
        {result && (
          <AnswerPanel
            question={result.question}
            answer={result.answer}
            visitHref={visitHref({ type: typeId, stage: stageId, question: result.question })}
            onFollowUp={ask}
          />
        )}
      </div>
    </section>
  )
}
