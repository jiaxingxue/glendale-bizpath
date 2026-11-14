'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function NoticeForm({ onSubmit }: { onSubmit: (text: string, image: File | null) => void }) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)

  function clearImage() {
    setImage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(text.trim(), image)
      }}
      className="flex flex-col gap-3 rounded-xl bg-muted p-4 md:p-5"
      aria-labelledby="notice-title"
    >
      <h2 id="notice-title" className="text-lg">
        {t('notice.title')}
      </h2>
      <label htmlFor="notice-text" className="text-sm font-medium">
        {t('notice.label')}
      </label>
      <textarea
        id="notice-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={t('notice.placeholder')}
        className="rounded-xl border border-border bg-card px-3 py-2.5 leading-relaxed placeholder:text-muted-foreground"
      />
      <div className="flex flex-wrap items-center gap-3">
        <input
          id="notice-image"
          ref={fileRef}
          type="file"
          accept="image/*"
          className="peer sr-only"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
        <label
          htmlFor="notice-image"
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-primary bg-card px-4 text-sm font-medium text-primary hover:bg-secondary peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {t('notice.upload')}
        </label>
        {image && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            {t('notice.selected', { name: image.name })}
            <button
              type="button"
              onClick={clearImage}
              className="inline-flex size-8 items-center justify-center rounded-md hover:bg-card"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">{t('notice.remove')}</span>
            </button>
          </span>
        )}
        <button
          type="submit"
          className="ms-auto min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {t('notice.button')}
        </button>
      </div>
    </form>
  )
}
