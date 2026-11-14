import corpusJson from '@/data/corpus.json'
import configJson from '@/data/lifecycle-config.json'

export type Contact = {
  desk: string
  address: string
  hours: string
  phone: string
  email: string
}

export type Requirement = {
  id: string
  title: string
  summary: string
  issuer: string
  fee: string
  documents: string[]
  contact: Contact
  apply_url: string
  url: string
  code: string
  law_url: string
  verified: string
  confidence: string
  business_types: string[]
  stages: string[]
  order: number
  deadlines: string[]
  applies_because: string
}

export type Stage = {
  id: string
  label_key: string
  examples: Record<string, string[]>
  guides: string[]
}

export type BusinessType = {
  id: string
  label_key: string
  sub_key: string
}

export type LifecycleConfig = {
  stages: Stage[]
  business_types: BusinessType[]
  coverage: Record<string, string>
  feedback_reasons: string[]
  permit_center: Contact
}

/** Requirements tagged with this id apply to every business type. */
const ALL_TYPES = 'all'
const FUNDING_STAGE = 'funding'
const LINK_ONLY = 'link-only'
const FALLBACK_LANGUAGE = 'en'

export const corpus = corpusJson as Requirement[]
export const lifecycleConfig = configJson as LifecycleConfig

export function getBusinessType(id: string) {
  return lifecycleConfig.business_types.find((type) => type.id === id)
}

export function getStage(id: string | undefined) {
  if (!id) return undefined
  return lifecycleConfig.stages.find((stage) => stage.id === id)
}

export function requirementsForType(typeId: string, stageId?: string) {
  return corpus
    .filter((req) => req.business_types.includes(typeId) || req.business_types.includes(ALL_TYPES))
    .filter((req) => !stageId || req.stages.includes(stageId))
    .sort((a, b) => a.order - b.order)
}

export function isLinkOnly(req: Requirement) {
  return req.confidence === LINK_ONLY
}

export function stageExamples(stage: Stage, lang: string) {
  const localized = stage.examples[lang]
  return localized && localized.length > 0 ? localized : (stage.examples[FALLBACK_LANGUAGE] ?? [])
}

export type StageGroup = { stage: Stage; requirements: Requirement[] }

/**
 * Groups requirements by lifecycle stage in config order. A requirement that spans several
 * stages is listed once, under the earliest stage (or the filtered stage when one is selected).
 */
export function groupByStage(requirements: Requirement[], stageId?: string): StageGroup[] {
  const stages = stageId ? lifecycleConfig.stages.filter((s) => s.id === stageId) : lifecycleConfig.stages
  const placed = new Set<string>()
  return stages
    .map((stage) => {
      const items = requirements.filter((req) => req.stages.includes(stage.id) && !placed.has(req.id))
      for (const req of items) placed.add(req.id)
      return { stage, requirements: items }
    })
    .filter((group) => group.requirements.length > 0)
}

export const permitCenter = lifecycleConfig.permit_center

export function coverageFor(typeId: string): 'verified' | 'baseline' {
  return lifecycleConfig.coverage[typeId] === 'verified' ? 'verified' : 'baseline'
}

/** Distinct contact desks from the corpus, funding/help entries first. */
export function helpContacts(limit = 3): Contact[] {
  const sorted = [...corpus].sort((a, b) => {
    const aHelp = a.stages.includes(FUNDING_STAGE) ? 0 : 1
    const bHelp = b.stages.includes(FUNDING_STAGE) ? 0 : 1
    return aHelp - bHelp || a.order - b.order
  })
  const seen = new Set<string>()
  const contacts: Contact[] = []
  for (const req of sorted) {
    if (seen.has(req.contact.desk)) continue
    seen.add(req.contact.desk)
    contacts.push(req.contact)
    if (contacts.length === limit) break
  }
  return contacts
}
