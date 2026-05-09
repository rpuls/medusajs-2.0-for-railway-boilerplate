import { Line, LineChart, ResponsiveContainer } from "recharts"

import { PALETTE } from "../../lib/reports/palette"

/**
 * Tiny inline trend chart. Drop next to any KPI to give the number
 * cyclical context — "is this revenue good or bad?" answered at a
 * glance. No axes, no tooltip, no animation.
 *
 *   <Sparkline values={[1,2,4,5,3,7,9]} width={80} height={20} />
 */
export const Sparkline = ({
  values,
  width = 80,
  height = 20,
  color,
  strokeWidth = 1.5,
}: {
  values: number[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
}) => {
  if (!values || values.length < 2) {
    return (
      <span
        style={{
          display: "inline-block",
          width,
          height,
          background: PALETTE.stone100,
          borderRadius: 2,
          verticalAlign: "middle",
        }}
        aria-hidden="true"
      />
    )
  }
  // Determine direction → color if not provided.
  const first = values[0]
  const last = values[values.length - 1]
  const trendColor =
    color ?? (last >= first ? PALETTE.emerald600 : PALETTE.rose600)

  const data = values.map((v, i) => ({ x: i, y: v }))

  return (
    <span
      style={{
        display: "inline-block",
        width,
        height,
        verticalAlign: "middle",
      }}
      aria-hidden="true"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="y"
            stroke={trendColor}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </span>
  )
}
