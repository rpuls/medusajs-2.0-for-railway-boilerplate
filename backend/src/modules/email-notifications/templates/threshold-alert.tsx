import { Hr, Section, Text, Button } from "@react-email/components"

import { Base } from "./base"

export const THRESHOLD_ALERT = "threshold-alert"

export interface ThresholdAlertEmailProps {
  alert: {
    name: string
    metricLabel: string
    comparator: string
    threshold: number
    value: number
    cooldownDays: number
    adminUrl: string | null
  }
  preview?: string
}

export const isThresholdAlertData = (
  data: any
): data is ThresholdAlertEmailProps =>
  typeof data?.alert === "object" &&
  typeof data?.alert?.name === "string" &&
  typeof data?.alert?.value === "number"

const COMPARATOR_PHRASE: Record<string, string> = {
  gt: "exceeded",
  gte: "reached",
  lt: "fell below",
  lte: "is at or below",
  eq: "matched",
}

export const ThresholdAlertEmail = ({
  alert,
  preview,
}: ThresholdAlertEmailProps) => {
  const verb = COMPARATOR_PHRASE[alert.comparator] ?? "crossed"
  const previewText =
    preview ??
    `${alert.name} ${verb} the threshold (${alert.value} vs ${alert.threshold}).`

  return (
    <Base preview={previewText}>
      <Section>
        <Text
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#737373",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          SC Prints alert
        </Text>
        <Text
          style={{
            margin: "4px 0 18px 0",
            fontSize: "20px",
            fontWeight: 700,
            color: "#dc2626",
          }}
        >
          {alert.name}
        </Text>

        <Text
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            color: "#1f2937",
          }}
        >
          The metric <strong>{alert.metricLabel}</strong> {verb} the
          configured threshold.
        </Text>

        <Section
          style={{
            background: "#f5f5f4",
            padding: "12px 14px",
            borderRadius: "6px",
            margin: "12px 0",
          }}
        >
          <Text style={{ margin: 0, fontSize: "13px", color: "#1f2937" }}>
            <strong>Current value:</strong> {alert.value}
          </Text>
          <Text
            style={{
              margin: "4px 0 0 0",
              fontSize: "13px",
              color: "#1f2937",
            }}
          >
            <strong>Threshold:</strong> {alert.comparator} {alert.threshold}
          </Text>
        </Section>

        {alert.adminUrl ? (
          <Section style={{ margin: "16px 0" }}>
            <Button
              href={`${alert.adminUrl}/app/reports`}
              style={{
                background: "#111111",
                color: "#ffffff",
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: 600,
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              Open Reports →
            </Button>
          </Section>
        ) : null}

        <Hr style={{ margin: "20px 0", borderColor: "#e5e5e5" }} />

        <Text
          style={{
            margin: 0,
            fontSize: "11px",
            color: "#737373",
            lineHeight: "16px",
          }}
        >
          You'll get this alert again in at most {alert.cooldownDays} days
          while the threshold remains breached. Manage thresholds at{" "}
          {alert.adminUrl ? `${alert.adminUrl}/app/reports` : "/app/reports"}.
        </Text>
      </Section>
    </Base>
  )
}

export default ThresholdAlertEmail
