import { Hr, Section, Text, Button } from "@react-email/components"

import { Base, STYLES, NAVY } from "./base"

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
      <Text style={STYLES.eyebrow}>SC Prints alert</Text>
      <Text style={{ ...STYLES.h1, color: "#dc2626" }}>{alert.name}</Text>

      <Text style={STYLES.body}>
        The metric <strong style={{ color: NAVY }}>{alert.metricLabel}</strong>{" "}
        {verb} the configured threshold.
      </Text>

      <Section
        style={{
          background: "#f9fafb",
          padding: "12px 16px",
          borderRadius: "8px",
          margin: "16px 0 0",
        }}
      >
        <Text style={{ margin: 0, fontSize: "13px", color: NAVY }}>
          <strong>Current value:</strong> {alert.value}
        </Text>
        <Text style={{ margin: "4px 0 0", fontSize: "13px", color: NAVY }}>
          <strong>Threshold:</strong> {alert.comparator} {alert.threshold}
        </Text>
      </Section>

      {alert.adminUrl ? (
        <Section style={{ margin: "20px 0 0" }}>
          <Button
            href={`${alert.adminUrl}/app/reports`}
            style={STYLES.buttonPrimary}
          >
            Open Reports &rarr;
          </Button>
        </Section>
      ) : null}

      <Hr style={STYLES.divider} />

      <Text style={STYLES.meta}>
        You&apos;ll get this alert again in at most {alert.cooldownDays} days
        while the threshold remains breached. Manage thresholds at{" "}
        {alert.adminUrl ? `${alert.adminUrl}/app/reports` : "/app/reports"}.
      </Text>
    </Base>
  )
}

export default ThresholdAlertEmail
