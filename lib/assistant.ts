import { corpus, isLinkOnly, permitCenter, requirementsForType, type Contact } from '@/lib/data'

export type AnswerRow = {
  requirementId: string
  title: string
  issuer: string
  fee: string
  where: string
  whereUrl: string
  sourceUrl: string
  code: string
  lawUrl: string
  why: string
}

export type AnswerContent = { summary: string; steps: string[] }

export type AssistantAnswer = {
  /** Language the answer text was written or translated into. */
  lang: string
  content: AnswerContent
  /** The governing English version, shown with "Show English". */
  english: AnswerContent
  rows: AnswerRow[]
  contact: Contact
  verified: string
  isSample: boolean
}

export type NoticeExplanation = {
  says: string
  requirementId: string
  isSample: boolean
}

export const SAMPLE_NOTICE_TEXT =
  'SAMPLE — NOTICE OF VIOLATION. Environmental Health inspection on [date]. Item 14: hand-washing sink blocked by stored equipment. Correct within 10 days. A re-inspection fee may apply.'

const SAMPLE_CONTENT: Record<string, AnswerContent> = {
  en: {
    summary:
      'PLACEHOLDER. To open a café you will usually need a city business license and an environmental health permit before you serve food. Start with the business license, then apply for the health permit.',
    steps: [
      'Register your business and apply for a business license.',
      'Apply for an environmental health permit and schedule the inspection.',
      'Bring your documents to the Permit Services Center if you have questions.',
    ],
  },
  es: {
    summary:
      'MARCADOR. Para abrir una cafetería normalmente necesita una licencia comercial de la ciudad y un permiso de salud ambiental antes de servir comida. Empiece con la licencia comercial y luego solicite el permiso de salud.',
    steps: [
      'Registre su negocio y solicite una licencia comercial.',
      'Solicite un permiso de salud ambiental y programe la inspección.',
      'Lleve sus documentos al Centro de Servicios de Permisos si tiene preguntas.',
    ],
  },
  hy: {
    summary:
      'ՕՐԻՆԱԿ։ Սրճարան բացելու համար սովորաբար անհրաժեշտ է քաղաքային բիզնես լիցենզիա և շրջակա միջավայրի առողջապահական թույլտվություն՝ նախքան սնունդ մատուցելը։',
    steps: [
      'Գրանցեք ձեր բիզնեսը և դիմեք բիզնես լիցենզիայի համար։',
      'Դիմեք առողջապահական թույլտվության համար և նշանակեք ստուգումը։',
      'Հարցերի դեպքում ձեր փաստաթղթերը բերեք Թույլտվությունների ծառայությունների կենտրոն։',
    ],
  },
}

function latestVerified(dates: string[]) {
  return dates.filter(Boolean).sort().pop() ?? ''
}

function sampleAnswer(lang: string): AssistantAnswer {
  const requirements = requirementsForType('food').filter((req) => !isLinkOnly(req) && !req.stages.includes('funding'))
  const answerLang = SAMPLE_CONTENT[lang] ? lang : 'en'
  return {
    lang: answerLang,
    content: SAMPLE_CONTENT[answerLang],
    english: SAMPLE_CONTENT.en,
    rows: requirements.map((req) => ({
      requirementId: req.id,
      title: req.title,
      issuer: req.issuer,
      fee: req.fee,
      where: req.contact.desk,
      whereUrl: req.apply_url,
      sourceUrl: req.url,
      code: req.code,
      lawUrl: req.law_url,
      why: req.applies_because,
    })),
    contact: permitCenter,
    verified: latestVerified(requirements.map((req) => req.verified)),
    isSample: true,
  }
}

/** Placeholder: returns sample data until the AI assistant is wired up. */
export async function askAssistant(_question: string, lang: string): Promise<AssistantAnswer> {
  return sampleAnswer(lang)
}

/** Placeholder: returns a sample explanation until notice explanation is wired up. */
export async function explainNotice(_input: { text: string; image: File | null; lang: string }): Promise<NoticeExplanation> {
  const requirement = corpus.find((req) => req.id === 'health-permit') ?? corpus[0]
  return {
    says: 'PLACEHOLDER. An inspector found a hand-washing sink blocked by equipment and asks you to fix it within 10 days.',
    requirementId: requirement.id,
    isSample: true,
  }
}
