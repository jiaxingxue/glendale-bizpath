'use client'

import { UserRound } from 'lucide-react'
import type { Contact } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { ContactDetails } from '@/components/contact-details'

export function TalkToPerson({ contact, headingLevel = 2 }: { contact: Contact; headingLevel?: 2 | 3 }) {
  const { t } = useI18n()
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-card-foreground">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <Heading className="text-lg">{t('person.title')}</Heading>
          <p className="text-sm text-muted-foreground">{t('person.intro')}</p>
        </div>
      </div>
      <p className="font-medium">{contact.desk}</p>
      <ContactDetails contact={contact} />
    </section>
  )
}
