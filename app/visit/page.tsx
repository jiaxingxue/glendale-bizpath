import type { Metadata } from 'next'
import { corpus, getBusinessType, getStage } from '@/lib/data'
import { VisitSheet } from '@/components/visit/visit-sheet'

export const metadata: Metadata = {
  title: 'Your visit to the Permit Services Center · Glendale BizPath',
  description: 'A printable checklist of documents, fees and contact details for your visit.',
}

function single(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
}

export default async function VisitPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string | string[]
    stage?: string | string[]
    q?: string | string[]
    ids?: string | string[]
  }>
}) {
  const params = await searchParams
  const typeId = getBusinessType(single(params.type) ?? '')?.id ?? null
  const stageId = getStage(single(params.stage))?.id ?? null
  const question = single(params.q)?.slice(0, 500) ?? null
  // Only ids that exist in the corpus are kept; the sheet never shows anything else.
  const requested = new Set((single(params.ids) ?? '').split(',').filter(Boolean))
  const entryIds = corpus.filter((req) => requested.has(req.id)).map((req) => req.id)

  return <VisitSheet typeId={typeId} stageId={stageId} question={question} entryIds={entryIds} />
}
