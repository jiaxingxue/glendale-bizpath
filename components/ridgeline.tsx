export function Ridgeline() {
  return (
    <div className="bg-brand" aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-14 w-full md:h-24">
        <path
          className="fill-brand-ridge"
          d="M0 70 L120 40 L210 62 L330 20 L450 58 L560 32 L690 66 L820 26 L940 60 L1060 34 L1180 64 L1310 28 L1440 54 L1440 120 L0 120 Z"
        />
        <path
          className="fill-background"
          d="M0 98 L150 74 L260 92 L400 62 L520 90 L660 70 L780 98 L920 68 L1050 94 L1190 74 L1320 96 L1440 78 L1440 120 L0 120 Z"
        />
      </svg>
    </div>
  )
}
