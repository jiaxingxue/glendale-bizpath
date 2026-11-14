import { corpus, lifecycleConfig, type Requirement } from '@/lib/data'

/**
 * The rules engine: plain code, no model. It is the only thing that decides which corpus
 * entries apply to a question. The model later explains these entries and nothing else.
 */

export const BUSINESS_TYPES = ['food', 'home', 'retail', 'services', 'office', 'hotel', 'other', 'unknown'] as const
export const STAGES = ['start', 'location', 'hire', 'notice', 'comply', 'funding', 'unknown'] as const

/**
 * What the question is about, from a closed list. Lets the rules tell "what do I need to open"
 * apart from "how much is the fee", and lets an uncovered topic (sidewalk tables) fall through
 * to the "no verified source" reply instead of a generic list.
 */
export const TOPICS = [
  'getting_started', // "what do I need to open / start ..."
  'registration', // Business Registration Certificate, business license
  'fees', // what something costs
  'renewal', // renewing, staying registered
  'moving', // new address, bigger space, change of activity or owner
  'lease', // about to sign a lease, choosing a space
  'zoning', // is my business allowed at this address
  'home_business', // running from home
  'food_permit', // health permit, plan check, kitchen
  'foodware', // utensils, straws, napkins, takeout containers, foam
  'sellers_permit', // sales tax, seller's permit
  'business_name', // DBA, fictitious business name
  'hiring', // hiring, employees, payroll registration
  'wages', // minimum wage
  'help', // funding, advising, business assistance
  'other', // anything not above
] as const

export type BusinessTypeId = (typeof BUSINESS_TYPES)[number]
export type StageId = (typeof STAGES)[number]
export type Topic = (typeof TOPICS)[number]

export type Facts = {
  home_based: boolean
  serves_food: boolean
  signing_lease: boolean
  is_hotel: boolean
  has_employees: boolean
}

export type RuleInput = {
  facts: Facts
  business_type: BusinessTypeId
  stage: StageId
  topics: Topic[]
}

type Context = RuleInput & {
  home: boolean
  food: boolean
  hotel: boolean
  has: (topic: Topic) => boolean
}

type Rule = {
  /** Plain-language reason shown as "why this applies" (English, like the corpus). */
  because: string
  when: (ctx: Context) => boolean
  entries: string[]
}

const COMMERCIAL_START = ['prelease-visit', 'zoning-check', 'brc-required', 'brc-fee', 'cdtfa-sellers-permit', 'fbn-statement']
const HOME_START = ['home-occ', 'home-occ-floor', 'fbn-statement']
const FOOD_RULES = ['foodware-on-request', 'polystyrene-ban']
const HIRE = ['edd-employer-registration', 'ca-min-wage']

/** Read top to bottom: when the condition holds, these entries apply. */
export const RULES: Rule[] = [
  // Opening a business
  { because: 'You are opening a business at a commercial location', when: (c) => !c.home && c.has('getting_started'), entries: COMMERCIAL_START },
  { because: 'You run the business from where you live', when: (c) => c.home && c.has('getting_started'), entries: HOME_START },
  { because: 'You prepare, serve or sell food', when: (c) => c.food && (c.has('getting_started') || c.has('food_permit')), entries: ['lac-health-permit'] },
  { because: 'You serve or sell food or drinks', when: (c) => c.food && c.has('getting_started'), entries: FOOD_RULES },

  // Location
  { because: 'You are about to sign a lease', when: (c) => !c.home && (c.facts.signing_lease || c.has('lease')), entries: ['prelease-visit', 'zoning-check'] },
  { because: 'You asked whether your business is allowed at an address', when: (c) => c.has('zoning'), entries: ['zoning-check'] },
  { because: 'You are moving or changing your business', when: (c) => !c.home && c.has('moving'), entries: ['brc-required', 'zoning-check', 'prelease-visit'] },

  // Registration, fees and renewal
  { because: 'Your business is located in Glendale (not home-based)', when: (c) => !c.home && (c.has('registration') || c.has('fees') || c.has('renewal')), entries: ['brc-required', 'brc-fee'] },
  { because: 'You run the business from where you live', when: (c) => c.home && (c.has('registration') || c.has('home_business')), entries: ['home-occ', 'home-occ-floor'] },

  // Food rules
  { because: 'You serve food or drinks', when: (c) => c.has('foodware'), entries: FOOD_RULES },

  // State and County registrations
  { because: 'You sell goods to customers', when: (c) => c.has('sellers_permit'), entries: ['cdtfa-sellers-permit'] },
  { because: 'You may operate under a business name different from your legal name', when: (c) => c.has('business_name'), entries: ['fbn-statement'] },

  // Employees and wages
  { because: 'You have, or plan to hire, employees', when: (c) => c.has('hiring') || c.facts.has_employees || c.stage === 'hire', entries: HIRE },
  { because: 'You asked about the minimum wage', when: (c) => c.has('wages'), entries: ['ca-min-wage'] },
  { because: 'You operate a hotel in Glendale', when: (c) => c.hotel && (c.has('hiring') || c.has('wages') || c.facts.has_employees || c.stage === 'hire'), entries: ['hotel-wage'] },

  // Help
  { because: 'You asked about help for your business', when: (c) => c.has('help') || c.stage === 'funding', entries: ['econdev-help'] },
]

export type SelectedEntry = { entry: Requirement; because: string }

function appliesToType(entry: Requirement, type: BusinessTypeId) {
  // Unknown type: keep the entry; the rule that selected it already encodes the facts.
  if (type === 'unknown') return true
  return entry.business_types.includes(type)
}

/** Position of the entry's earliest lifecycle stage, so results read Start → Location → Hire → Comply. */
function lifecycleRank(entry: Requirement) {
  const order = lifecycleConfig.stages.map((stage) => stage.id)
  const ranks = entry.stages.map((stage) => order.indexOf(stage)).filter((rank) => rank >= 0)
  return ranks.length > 0 ? Math.min(...ranks) : order.length
}

/** Runs the rules and returns the matching entries in lifecycle order, each with its first trigger. */
export function runRules(input: RuleInput): SelectedEntry[] {
  const home = input.facts.home_based || input.business_type === 'home'
  const ctx: Context = {
    ...input,
    // A "start" question with no specific topic is a "what do I need" question.
    topics: input.topics.length === 0 && input.stage === 'start' ? ['getting_started'] : input.topics.filter((t) => t !== 'other'),
    home,
    food: input.facts.serves_food || input.business_type === 'food',
    hotel: input.facts.is_hotel || input.business_type === 'hotel',
    has: () => false,
  }
  ctx.has = (topic) => ctx.topics.includes(topic)
  const type: BusinessTypeId = home ? 'home' : input.business_type

  const selected = new Map<string, string>()
  for (const rule of RULES) {
    if (!rule.when(ctx)) continue
    for (const id of rule.entries) if (!selected.has(id)) selected.set(id, rule.because)
  }

  return corpus
    .filter((entry) => selected.has(entry.id) && appliesToType(entry, type))
    .sort((a, b) => lifecycleRank(a) - lifecycleRank(b) || a.order - b.order)
    .map((entry) => ({ entry, because: selected.get(entry.id) as string }))
}
