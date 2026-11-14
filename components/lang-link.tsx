'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

type LangLinkProps = Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }

/** Internal link that carries the selected language in a ?lang= parameter. */
export function LangLink({ href, ...props }: LangLinkProps) {
  const { href: localize } = useI18n()
  return <Link href={localize(href)} {...props} />
}
