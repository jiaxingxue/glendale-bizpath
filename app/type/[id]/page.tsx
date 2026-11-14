import { notFound } from 'next/navigation'
import { getBusinessType, getStage, lifecycleConfig } from '@/lib/data'
import { TypeGuide } from '@/components/type/type-guide'

export function generateStaticParams() {
  return lifecycleConfig.business_types.map((type) => ({ id: type.id }))
}

export default async function TypePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ stage?: string | string[] }>
}) {
  const { id } = await params
  const { stage } = await searchParams
  if (!getBusinessType(id)) notFound()
  const stageId = getStage(typeof stage === 'string' ? stage : undefined)?.id ?? null

  return <TypeGuide typeId={id} stageId={stageId} />
}
