import { Container, Heading, Text } from "@medusajs/ui"
import type { ReactNode } from "react"

/**
 * Standard wrapper for every report on the Reports page. Title above,
 * caption below, chart in between. Keeps spacing/typography consistent
 * across reports.
 */
export const ReportCard = ({
  title,
  caption,
  loading,
  error,
  children,
  rightAccessory,
}: {
  title: string
  caption?: string
  loading?: boolean
  error?: string | null
  children: ReactNode
  rightAccessory?: ReactNode
}) => {
  return (
    <Container className="flex flex-col gap-y-3 p-4">
      <div className="flex items-start justify-between gap-x-3">
        <div className="flex flex-col gap-y-0.5">
          <Heading level="h2" className="text-base font-semibold">
            {title}
          </Heading>
          {caption ? (
            <Text size="xsmall" className="text-ui-fg-subtle">
              {caption}
            </Text>
          ) : null}
        </div>
        {rightAccessory ? (
          <div className="shrink-0">{rightAccessory}</div>
        ) : null}
      </div>
      {error ? (
        <Text size="small" className="text-ui-tag-red-icon">
          {error}
        </Text>
      ) : null}
      {loading && !error ? (
        <div className="h-48 flex items-center justify-center">
          <Text size="small" className="text-ui-fg-muted">
            Loading…
          </Text>
        </div>
      ) : null}
      {!loading && !error ? children : null}
    </Container>
  )
}
