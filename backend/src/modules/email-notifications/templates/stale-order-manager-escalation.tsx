import { Section, Text, Button } from "@react-email/components"

import { Base, STYLES, NAVY } from "./base"

export const STALE_ORDER_MANAGER_ESCALATION = "stale-order-manager-escalation"

export interface StaleOrderManagerEscalationProps {
  escalation: {
    orderDisplayId: number | null
    orderId: string
    stage: string
    daysInStage: number
    ownerLabel: string | null
    customerEmail: string | null
    orderUrl: string | null
  }
  preview?: string
}

export const isStaleOrderManagerEscalationData = (
  data: any
): data is StaleOrderManagerEscalationProps =>
  typeof data?.escalation === "object" &&
  typeof data?.escalation?.stage === "string" &&
  typeof data?.escalation?.daysInStage === "number"

export const StaleOrderManagerEscalationEmail = ({
  escalation,
  preview,
}: StaleOrderManagerEscalationProps) => {
  const orderLabel = escalation.orderDisplayId
    ? `#${escalation.orderDisplayId}`
    : escalation.orderId.slice(-8)
  const previewText =
    preview ??
    `Order ${orderLabel} has been stale ${escalation.daysInStage} days without movement.`

  return (
    <Base preview={previewText}>
      <Text style={STYLES.eyebrow}>Manager escalation</Text>
      <Text style={{ ...STYLES.h1, color: "#dc2626" }}>
        Order {orderLabel} is overdue intervention
      </Text>

      <Text style={STYLES.body}>
        This order has been in{" "}
        <strong style={{ color: NAVY }}>{escalation.stage}</strong> for{" "}
        <strong style={{ color: NAVY }}>{escalation.daysInStage} days</strong>{" "}
        and the owner&apos;s follow-up window has expired without movement.
      </Text>

      <Section
        style={{
          background: "#f9fafb",
          padding: "12px 16px",
          borderRadius: "8px",
          margin: "16px 0 0",
        }}
      >
        {escalation.ownerLabel ? (
          <Text style={{ ...STYLES.meta, margin: 0 }}>
            <strong>Owner:</strong> {escalation.ownerLabel}
          </Text>
        ) : (
          <Text style={{ ...STYLES.meta, margin: 0 }}>
            <strong>Owner:</strong> unassigned
          </Text>
        )}
        {escalation.customerEmail ? (
          <Text style={{ ...STYLES.meta, margin: "4px 0 0" }}>
            <strong>Customer:</strong> {escalation.customerEmail}
          </Text>
        ) : null}
      </Section>

      {escalation.orderUrl ? (
        <Section style={{ margin: "24px 0 0" }}>
          <Button href={escalation.orderUrl} style={STYLES.buttonPrimary}>
            Open the order &rarr;
          </Button>
        </Section>
      ) : null}

      <Text style={{ ...STYLES.meta, margin: "20px 0 0" }}>
        You only receive one escalation email per stale streak — once the
        order moves stage, the badge clears and the counter resets.
      </Text>
    </Base>
  )
}

export default StaleOrderManagerEscalationEmail
