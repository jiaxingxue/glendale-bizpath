'use client'

import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type AskFormProps = {
  id: string
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  inputRef?: React.Ref<HTMLInputElement>
}

/** Large question input used on the home hero and at the bottom of type pages. Sits on the brand background. */
export function AskForm({ id, value, onChange, onSubmit, inputRef }: AskFormProps) {
  const { t } = useI18n()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="flex flex-col gap-3"
    >
      <label htmlFor={id} className="sr-only">
        {t('ask.label')}
      </label>
      <div className="flex flex-col gap-2 rounded-2xl bg-card p-2 sm:flex-row">
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
          }}
          placeholder={t('ask.placeholder')}
          autoComplete="off"
          aria-describedby={`${id}-note`}
          className="h-14 min-w-0 flex-1 rounded-xl bg-card px-4 text-base text-card-foreground placeholder:text-muted-foreground focus-visible:outline-primary md:text-lg"
        />
        <button
          type="submit"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-accent px-7 text-lg font-semibold text-accent-foreground hover:bg-accent/90 focus-visible:outline-primary"
        >
          {t('ask.button')}
          <ArrowRight className="size-5 rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
      <p id={`${id}-note`} className="text-sm leading-relaxed text-brand-muted">
        {t('ask.note')}
      </p>
    </form>
  )
}
