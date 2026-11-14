import { AiDisclosureModal } from '@/components/home/ai-disclosure-modal'
import { AskHero } from '@/components/home/ask-hero'
import { BusinessTypeGrid } from '@/components/home/business-type-grid'
import { HelpContacts } from '@/components/home/help-contacts'
import { Ridgeline } from '@/components/ridgeline'

export default function HomePage() {
  return (
    <>
      <AiDisclosureModal />
      <AskHero />
      <Ridgeline />
      <BusinessTypeGrid />
      <HelpContacts />
    </>
  )
}
