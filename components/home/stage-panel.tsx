'use client'

import { ChevronRight, MessageCircleQuestion } from 'lucide-react'
import { getBusinessType, stageExamples, type Stage } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { LangLink } from '@/components/lang-link'
import { NoticeForm } from '@/components/home/notice-form'

const NOTICE_STAGE_ID = 'notice'

type StagePanelProps = {
  stage: Stage
  onExample: (text: string) => void
  onExplainNotice: (text: string, isSample: boolean) => void
}

export function StagePanel({ stage, onExample, onExplainNotice }: StagePanelProps) {
  const { t, lang } = useI18n()
  const guides = stage.guides.map(getBusinessType).filter((g) => g !== undefined)

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 text-card-foreground md:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg">{t('panel.try')}</h2>
          <ul className="flex flex-col gap-2">
            {stageExamples(stage, lang).map((example) => (
              <li key={example}>
                <button
                  type="button"
                  onClick={() => onExample(example)}
                  className="flex w-full items-start gap-2 rounded-xl border border-border px-3 py-2.5 text-start leading-relaxed hover:border-primary hover:bg-muted"
                >
                  <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{example}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {guides.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg">{t('panel.guide')}</h2>
          <ul className="flex flex-col">
            {guides.map((guide) => (
              <li key={guide.id} className="border-b border-border last:border-b-0">
                <LangLink
                  href={`/type/${guide.id}?stage=${stage.id}`}
                  className="flex items-center justify-between gap-2 rounded-md py-3 font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t(guide.label_key)}
                  <ChevronRight className="size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
                </LangLink>
              </li>
            ))}
          </ul>
        </div>
        )}
      </div>

      {stage.id === NOTICE_STAGE_ID && <NoticeForm onSubmit={onExplainNotice} />}
    </div>
  )
}
