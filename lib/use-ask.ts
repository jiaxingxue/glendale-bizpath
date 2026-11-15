'use client'

import { useRef, useState } from 'react'
import { askAssistant, explainNotice, type AssistantAnswer, type OnUpdate } from '@/lib/assistant'

type Kind = 'question' | 'notice'

export type AskState =
  | { status: 'idle' }
  | { status: 'loading'; kind: Kind; question: string }
  | { status: 'streaming' | 'done'; kind: Kind; question: string; answer: AssistantAnswer }
  | { status: 'error'; kind: Kind; question: string }

/**
 * Sends a question to /api/ask or a notice to /api/notice and exposes the streaming answer.
 * A newer request replaces an older one still in flight.
 */
export function useAsk(lang: string) {
  const [state, setState] = useState<AskState>({ status: 'idle' })
  const latest = useRef(0)

  async function run(kind: Kind, question: string, request: (onUpdate: OnUpdate) => Promise<AssistantAnswer>) {
    const id = ++latest.current
    const isCurrent = () => id === latest.current
    setState({ status: 'loading', kind, question })
    try {
      const answer = await request((partial) => {
        if (isCurrent()) setState({ status: 'streaming', kind, question, answer: partial })
      })
      if (isCurrent()) setState({ status: 'done', kind, question, answer })
    } catch (error) {
      console.error(error)
      if (isCurrent()) setState({ status: 'error', kind, question })
    }
  }

  return {
    state,
    ask: (question: string) => run('question', question, (onUpdate) => askAssistant(question, lang, onUpdate)),
    explain: (text: string) => run('notice', text, (onUpdate) => explainNotice(text, lang, onUpdate)),
  }
}
