import { PALETTE } from "../../lib/reports/palette"

/**
 * Skeleton placeholder for chart cards. Replaces the previous "Loading…"
 * spinner with grey bars matching the rough shape of the eventual chart.
 * Loading feels instant rather than empty.
 */
export const SkeletonBars = ({ height = 192 }: { height?: number }) => {
  const bars = [55, 80, 35, 90, 60, 75, 45, 70, 85, 50, 65, 40, 78, 58]
  return (
    <div
      className="flex items-end gap-x-1.5 px-1"
      style={{ height }}
      role="status"
      aria-label="Loading chart data"
    >
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm animate-pulse"
          style={{
            height: `${h}%`,
            background: PALETTE.stone200,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  )
}

export const SkeletonRows = ({ rows = 8 }: { rows?: number }) => (
  <div
    className="flex flex-col gap-y-2"
    role="status"
    aria-label="Loading rows"
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-6 rounded animate-pulse"
        style={{
          background: PALETTE.stone200,
          opacity: 1 - i * 0.05,
          animationDelay: `${i * 50}ms`,
        }}
      />
    ))}
  </div>
)
