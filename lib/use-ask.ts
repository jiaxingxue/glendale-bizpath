'use client'

import { useRef, useState } from 'react'
import { askAssistant, type AssistantAnswer } from '@/lib/assistant'

export type AskState =
  | { status: 'idle' }
  | { status: 'loading'; question: string }
  | { status: 'streaming' | 'done'; question: string; answer: AssistantAnswer }
  | { status: 'error'; question: string }

/** Sends a question to /api/ask and exposes the streaming answer. A newer question cancels an older one. */
export function useAsk(lang: string) {
  const [state, setState] = useState<AskState>({ status: 'idle' })
  const latest = useRef(0)

  async function ask(question: string) {
    const id = ++latest.current
    const isCurrent = () => id === latest.current
    setState({ status: 'loading', question })
    try {
      const answer = await askAssistant(question, lang, (partial) => {
        if (isCurrent()) setState({ status: 'streaming', question, answer: partial })
      })
      if (isCurrent()) setState({ status: 'done', question, answer })
    } catch (error) {
      console.error(error)
      if (isCurrent()) setState({ status: 'error', question })
    }
  }

  return { state, ask }
}
