import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

/**
 * "Last updated 12s ago" stamp for any data card. Re-renders the
 * relative time once a minute so the label stays current.
 */
const formatRelative = (ms: number): string => {
  const diff = Date.now() - ms
  if (diff < 5_000) return "just now"
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

export const LastUpdated = ({
  loadedAt,
  prefix = "Updated",
}: {
  loadedAt: number | null
  prefix?: string
}) => {
  const [, force] = useState(0)
  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 30_000)
    return () => clearInterval(i)
  }, [])
  if (loadedAt === null) return null
  return (
    <Text size="xsmall" className="text-ui-fg-muted">
      {prefix} {formatRelative(loadedAt)}
    </Text>
  )
}
