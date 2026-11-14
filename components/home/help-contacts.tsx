'use client'

import { helpContacts } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { ContactDetails } from '@/components/contact-details'

export function HelpContacts() {
  const { t } = useI18n()
  const contacts = helpContacts(3)

  return (
    <section aria-labelledby="help-title" className="bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:px-6 md:py-16">
        <h2 id="help-title" className="text-2xl md:text-3xl">
          {t('help.title')}
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {contacts.map((contact) => (
            <li key={contact.desk} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg">{contact.desk}</h3>
              <ContactDetails contact={contact} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
