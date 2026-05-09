import { Button, Container, Heading, Text } from "@medusajs/ui"
import { ArrowDownTray } from "@medusajs/icons"
import type { ReactNode } from "react"

import { downloadCsv, timestampedFilename } from "../../lib/reports/csv"

/**
 * Standard wrapper for every report on the Reports page. Title above,
 * caption below, chart in between. Keeps spacing/typography consistent
 * across reports.
 *
 * Pass `csv` to render a "Download CSV" icon button in the card header.
 * The function is called lazily when clicked — return null/undefined to
 * suppress the download (e.g., no data yet).
 */
export const ReportCard = ({
  title,
  caption,
  loading,
  error,
  children,
  rightAccessory,
  csv,
}: {
  title: string
  caption?: string
  loading?: boolean
  error?: string | null
  children: ReactNode
  rightAccessory?: ReactNode
  csv?: {
    filenameBase: string
    build: () =>
      | { content: string; filename?: string }
      | string
      | null
      | undefined
  }
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
        <div className="shrink-0 flex items-center gap-x-2">
          {rightAccessory}
          {csv ? (
            <Button
              size="small"
              variant="transparent"
              onClick={() => {
                const result = csv.build()
                if (!result) return
                if (typeof result === "string") {
                  downloadCsv(timestampedFilename(csv.filenameBase), result)
                } else {
                  downloadCsv(
                    result.filename ?? timestampedFilename(csv.filenameBase),
                    result.content
                  )
                }
              }}
              title="Download CSV"
            >
              <ArrowDownTray /> CSV
            </Button>
          ) : null}
        </div>
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
