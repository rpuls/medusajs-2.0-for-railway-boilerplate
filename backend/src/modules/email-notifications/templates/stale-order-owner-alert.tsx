import { Section, Text, Button } from "@react-email/components"

import { Base, STYLES, NAVY } from "./base"

export const STALE_ORDER_OWNER_ALERT = "stale-order-owner-alert"

export interface StaleOrderOwnerAlertProps {
  alert: {
    orderDisplayId: number | null
    orderId: string
    stage: string
    daysInStage: number
    customerEmail: string | null
    orderUrl: string | null
  }
  preview?: string
}

export const isStaleOrderOwnerAlertData = (
  data: any
): data is StaleOrderOwnerAlertProps =>
  typeof data?.alert === "object" &&
  typeof data?.alert?.stage === "string" &&
  typeof data?.alert?.daysInStage === "number"

export const StaleOrderOwnerAlertEmail = ({
  alert,
  preview,
}: StaleOrderOwnerAlertProps) => {
  const orderLabel = alert.orderDisplayId
    ? `#${alert.orderDisplayId}`
    : alert.orderId.slice(-8)
  const previewText =
    preview ??
    `Order ${orderLabel} has been in "${alert.stage}" for ${alert.daysInStage} days.`

  return (
    <Base preview={previewText}>
      <Text style={STYLES.eyebrow}>Stale order — needs your eyes</Text>
      <Text style={{ ...STYLES.h1, color: "#f97316" }}>
        Order {orderLabel}
      </Text>

      <Text style={STYLES.body}>
        This order has been sitting in{" "}
        <strong style={{ color: NAVY }}>{alert.stage}</strong> for{" "}
        <strong style={{ color: NAVY }}>{alert.daysInStage} days</strong>. As
        the order owner you&apos;re the natural person to push it forward or
        surface a blocker.
      </Text>

      {alert.customerEmail ? (
        <Section
          style={{
            background: "#f9fafb",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "16px 0 0",
          }}
        >
          <Text style={{ ...STYLES.meta, margin: 0 }}>
            <strong>Customer:</strong> {alert.customerEmail}
          </Text>
        </Section>
      ) : null}

      {alert.orderUrl ? (
        <Section style={{ margin: "24px 0 0" }}>
          <Button href={alert.orderUrl} style={STYLES.buttonPrimary}>
            Open the order &rarr;
          </Button>
        </Section>
      ) : null}

      <Text style={{ ...STYLES.meta, margin: "20px 0 0" }}>
        A follow-up task has been created in /app/tasks for you. The badge
        clears automatically once the production stage advances.
      </Text>
    </Base>
  )
}

export default StaleOrderOwnerAlertEmail
