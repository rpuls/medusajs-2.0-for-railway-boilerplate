import { Button, DropdownMenu, Text } from "@medusajs/ui"
import { ArrowPath } from "@medusajs/icons"

import type { POSSession } from "../types"

type Props = {
  current: POSSession | null
  others: POSSession[]
  onResume: (session: POSSession) => void
  onDiscard: (sessionId: string) => void
}

/**
 * Lists other active POS sessions owned by the current admin so they
 * can swap between in-flight walk-ins. Empty list = button is hidden
 * by the parent. "Resume" makes that session the active one and loads
 * its items into the cart; "Discard" cancels the session.
 */
export const ParkedSalesPicker = ({
  current,
  others,
  onResume,
  onDiscard,
}: Props) => {
  if (others.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="small">
          <ArrowPath className="mr-1" />
          Parked ({others.length})
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-[280px]">
        {others.map((s) => {
          const itemCount = Array.isArray(s.items) ? s.items.length : 0
          const ageMinutes = Math.max(
            0,
            Math.round((Date.now() - new Date(s.created_at).getTime()) / 60000)
          )
          return (
            <DropdownMenu.Item
              key={s.id}
              className="flex items-center justify-between gap-3"
              onClick={() => onResume(s)}
            >
              <div className="min-w-0">
                <Text size="small" className="font-medium truncate">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {ageMinutes < 60
                    ? `${ageMinutes}m ago`
                    : `${Math.round(ageMinutes / 60)}h ago`}
                  {" · "}
                  {s.id.slice(-6)}
                </Text>
              </div>
              <Button
                size="small"
                variant="transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  onDiscard(s.id)
                }}
              >
                Discard
              </Button>
            </DropdownMenu.Item>
          )
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
