export function AndeanBorder({ className = '' }: { className?: string }) {
  return (
    <div className={`h-3 w-full overflow-hidden ${className}`}>
      <svg viewBox="0 0 1200 12" preserveAspectRatio="none" className="h-full w-full">
        <path
          d="M0,6 L50,0 L100,6 L150,0 L200,6 L250,0 L300,6 L350,0 L400,6 L450,0 L500,6 L550,0 L600,6 L650,0 L700,6 L750,0 L800,6 L850,0 L900,6 L950,0 L1000,6 L1050,0 L1100,6 L1150,0 L1200,6 L1200,12 L0,12 Z"
          fill="hsl(var(--primary)/0.15)"
        />
        <path
          d="M0,8 L30,2 L60,8 L90,2 L120,8 L150,2 L180,8 L210,2 L240,8 L270,2 L300,8 L330,2 L360,8 L390,2 L420,8 L450,2 L480,8 L510,2 L540,8 L570,2 L600,8 L630,2 L660,8 L690,2 L720,8 L750,2 L780,8 L810,2 L840,8 L870,2 L900,8 L930,2 L960,8 L990,2 L1020,8 L1050,2 L1080,8 L1110,2 L1140,8 L1170,2 L1200,8 L1200,12 L0,12 Z"
          fill="hsl(var(--primary)/0.08)"
        />
      </svg>
    </div>
  );
}
