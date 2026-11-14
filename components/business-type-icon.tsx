import { BedDouble, Briefcase, House, type LucideIcon, Scissors, ShoppingBag, Store, UtensilsCrossed } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  home: House,
  retail: ShoppingBag,
  personal: Scissors,
  office: Briefcase,
  lodging: BedDouble,
}

export function BusinessTypeIcon({ id, className }: { id: string; className?: string }) {
  const Icon = ICONS[id] ?? Store
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />
}
