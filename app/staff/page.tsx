import type { Metadata } from 'next'
import { entriesDueForReview } from '@/lib/staff-stats'
import { StaffDashboard } from '@/components/staff/staff-dashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Staff dashboard · Glendale BizPath',
  description: 'Usage, content gaps and review status for Glendale BizPath.',
  robots: { index: false, follow: false },
}

export default function StaffPage() {
  return <StaffDashboard needsReview={entriesDueForReview()} />
}
