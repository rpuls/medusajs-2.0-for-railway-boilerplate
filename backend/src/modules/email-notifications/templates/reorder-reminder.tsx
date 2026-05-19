import { Hr, Section, Text, Button } from "@react-email/components"

import { Base, STYLES } from "./base"

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
  unsubscribeUrl?: string
}

export const isReorderReminderData = (
  data: any
): data is ReorderReminderEmailProps =>
  typeof data?.reminder === "object" &&
  typeof data?.reminder?.daysSinceLast === "number"

export const ReorderReminderEmail = ({
  reminder,
  preview,
  unsubscribeUrl,
}: ReorderReminderEmailProps) => {
  const greeting = reminder.firstName ? `Hey ${reminder.firstName},` : "Hey,"
  const previewText =
    preview ??
    `It's been about ${Math.round(reminder.daysSinceLast)} days since your last SC Prints order — fancy a reorder?`

  return (
    <Base preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <Text style={STYLES.eyebrow}>Time for another run?</Text>
      <Text style={STYLES.h1}>{greeting}</Text>
      <Text style={STYLES.body}>
        It&apos;s been about {Math.round(reminder.daysSinceLast)} days since
        your last SC Prints order
        {reminder.lastOrderDisplayId
          ? ` (#${reminder.lastOrderDisplayId})`
          : ""}
        .
        {reminder.daysSinceLast >= reminder.medianGapDays
          ? ` That's around when you usually come back —`
          : ""}{" "}
        if you&apos;re due for another, we&apos;ve got everything saved on
        file.
      </Text>

      {reminder.reorderUrl ? (
        <Section style={{ margin: "24px 0 0" }}>
          <Button href={reminder.reorderUrl} style={STYLES.buttonPrimary}>
            Reorder your last design &rarr;
          </Button>
        </Section>
      ) : null}

      {reminder.accountOrdersUrl ? (
        <Text style={{ ...STYLES.meta, margin: "16px 0 0", fontSize: "13px" }}>
          Or{" "}
          <a href={reminder.accountOrdersUrl} style={STYLES.link}>
            browse your order history
          </a>{" "}
          to repeat any past order.
        </Text>
      ) : null}

      <Hr style={STYLES.divider} />

      <Text style={STYLES.meta}>
        You&apos;re getting this because we noticed your typical order cadence
        is about every {Math.round(reminder.medianGapDays)} days. Reply with
        &ldquo;stop reorder reminders&rdquo; if you&apos;d rather we
        didn&apos;t.
      </Text>
    </Base>
  )
}

export default ReorderReminderEmail
