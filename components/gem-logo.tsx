export function GemLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 5h14l6 7-13 15L3 12z" />
      <path d="M3 12h26" />
      <path d="M9 5l3 7 4-7 4 7 3-7" />
      <path d="M12 12l4 15 4-15" />
    </svg>
  )
}
