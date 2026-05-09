import { Hr, Section, Text, Button } from "@react-email/components"

import { Base } from "./base"

export const REORDER_REMINDER = "reorder-reminder"

export interface ReorderReminderEmailProps {
  reminder: {
    firstName: string | null
    lastOrderDisplayId: number | null
    lastOrderTotal: number
    currencyCode: string
    daysSinceLast: number
    medianGapDays: number
    reorderUrl: string | null
    accountOrdersUrl: string | null
  }
  preview?: string
}

export const isReorderReminderData = (
  data: any
): data is ReorderReminderEmailProps =>
  typeof data?.reminder === "object" &&
  typeof data?.reminder?.daysSinceLast === "number"

const formatCurrency = (n: number, code: string) => {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: code || "AUD",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

export const ReorderReminderEmail = ({
  reminder,
  preview,
}: ReorderReminderEmailProps) => {
  const greeting = reminder.firstName ? `Hey ${reminder.firstName},` : "Hey,"
  const previewText =
    preview ??
    `It's been about ${Math.round(reminder.daysSinceLast)} days since your last SC Prints order — fancy a reorder?`

  return (
    <Base preview={previewText}>
      <Section>
        <Text
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 700,
            color: "#111111",
          }}
        >
          {greeting}
        </Text>
        <Text
          style={{
            margin: "12px 0 0 0",
            fontSize: "15px",
            color: "#1f2937",
            lineHeight: "22px",
          }}
        >
          It's been about {Math.round(reminder.daysSinceLast)} days since your
          last SC Prints order
          {reminder.lastOrderDisplayId
            ? ` (#${reminder.lastOrderDisplayId})`
            : ""}
          .
          {reminder.daysSinceLast >= reminder.medianGapDays
            ? ` That's around when you usually come back —`
            : ""}{" "}
          if you're due for another run, we've got everything saved on file.
        </Text>

        {reminder.reorderUrl ? (
          <Section style={{ margin: "20px 0" }}>
            <Button
              href={reminder.reorderUrl}
              style={{
                background: "#111111",
                color: "#ffffff",
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              Reorder your last design →
            </Button>
          </Section>
        ) : null}

        {reminder.accountOrdersUrl ? (
          <Text
            style={{
              margin: "10px 0 0 0",
              fontSize: "13px",
              color: "#737373",
            }}
          >
            Or{" "}
            <a
              href={reminder.accountOrdersUrl}
              style={{ color: "#111111", textDecoration: "underline" }}
            >
              browse your order history
            </a>{" "}
            to repeat any past order.
          </Text>
        ) : null}

        <Hr style={{ margin: "24px 0", borderColor: "#e5e5e5" }} />

        <Text
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#737373",
            lineHeight: "18px",
          }}
        >
          You're getting this because we noticed your typical order cadence is
          about every {Math.round(reminder.medianGapDays)} days. Reply with
          "stop reorder reminders" if you'd rather we didn't.
        </Text>
      </Section>
    </Base>
  )
}

export default ReorderReminderEmail
