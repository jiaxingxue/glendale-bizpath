'use client'

import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { Contact } from '@/lib/data'
import { useI18n } from '@/lib/i18n'

export function ContactDetails({ contact }: { contact: Contact }) {
  const { t } = useI18n()
  const rows = [
    { key: 'contact.address', icon: MapPin, value: contact.address },
    { key: 'contact.hours', icon: Clock, value: contact.hours },
    { key: 'contact.phone', icon: Phone, value: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, '')}` },
    { key: 'contact.email', icon: Mail, value: contact.email, href: `mailto:${contact.email}` },
  ].filter((row) => row.value)

  return (
    <dl className="flex flex-col gap-2 text-sm leading-relaxed">
      {rows.map(({ key, icon: Icon, value, href }) => (
        <div key={key} className="flex items-start gap-2">
          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <dt className="sr-only">{t(key)}</dt>
          <dd className="min-w-0 break-words">
            {href ? (
              <a href={href} className="font-medium text-primary underline underline-offset-4">
                {value}
              </a>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
