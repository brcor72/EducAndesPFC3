export function AndeanBorder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-3 w-full ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, var(--primary) 0 14px, transparent 14px 22px, var(--puna) 22px 36px, transparent 36px 44px, var(--sun) 44px 58px, transparent 58px 66px)",
      }}
      aria-hidden="true"
    />
  );
}
