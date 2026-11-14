import type { Metadata } from 'next'
import { DeadlineList } from '@/components/deadlines/deadline-list'

export const metadata: Metadata = {
  title: 'Deadlines · Glendale BizPath',
  description: 'Every business deadline in Glendale BizPath, grouped by lifecycle stage.',
}

export default function DeadlinesPage() {
  return <DeadlineList />
}
