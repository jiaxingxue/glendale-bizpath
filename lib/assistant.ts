export type AssistantAnswer = null

/** Placeholder: wire up the AI assistant here. */
export async function askAssistant(_question: string, _lang: string): Promise<AssistantAnswer> {
  return null
}

/** Placeholder: wire up notice explanation here. */
export async function explainNotice(_input: {
  text: string
  image: File | null
  lang: string
}): Promise<AssistantAnswer> {
  return null
}
