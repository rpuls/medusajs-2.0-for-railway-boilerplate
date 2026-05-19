import { Hr, Section, Text, Button } from "@react-email/components"

import { Base, STYLES, NAVY } from "./base"
import type { ChurnSeverity } from "../../../services/churn-queue/build-queue"

export const WINBACK = "winback"

export interface WinbackEmailProps {
  winback: {
    firstName: string | null
    severity: ChurnSeverity
    daysSinceLast: number
    lastOrderDisplayId: number | null
    storefrontUrl: string | null
    storeOrdersUrl: string | null
    customizerUrl: string | null
  }
  preview?: string
  unsubscribeUrl?: string
}

export const isWinbackData = (data: any): data is WinbackEmailProps =>
  typeof data?.winback === "object" &&
  typeof data?.winback?.severity === "string"

const COPY_BY_SEVERITY: Record<
  ChurnSeverity,
  { headline: string; body: string }
> = {
  drifting: {
    headline: "Haven't seen you in a bit",
    body: "We noticed you usually drop in more often. Anything you wanted to print recently? Hit reply if there's something specific we can help you mock up.",
  },
  at_risk: {
    headline: "It's been a while — checking in",
    body: "It's been a while since your last order. If we got something wrong last time, we'd love to make it right — reply to this email and we'll sort it. If life just got busy, we're here when you're ready.",
  },
  lost: {
    headline: "We'd love to have you back",
    body: "It's been a long time. The team's grown, the kit's better, and we'd genuinely like another shot. Reply with what you're working on and we'll put together a quote — no pressure.",
  },
}

export const WinbackEmail = ({ winback, preview, unsubscribeUrl }: WinbackEmailProps) => {
  const greeting = winback.firstName ? `Hey ${winback.firstName},` : "Hey,"
  const copy = COPY_BY_SEVERITY[winback.severity]
  const previewText = preview ?? copy.headline

  const ctaUrl = winback.customizerUrl ?? winback.storefrontUrl

  return (
    <Base preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <Text style={STYLES.eyebrow}>Welcome back</Text>
      <Text style={STYLES.h1}>{greeting}</Text>
      <Text style={{ ...STYLES.h2, margin: "16px 0 0" }}>{copy.headline}</Text>
      <Text style={STYLES.body}>{copy.body}</Text>

      {ctaUrl ? (
        <Section style={{ margin: "24px 0 0" }}>
          <Button href={ctaUrl} style={STYLES.buttonPrimary}>
            Start a new design &rarr;
          </Button>
        </Section>
      ) : null}

      {winback.storeOrdersUrl ? (
        <Text style={{ ...STYLES.meta, margin: "16px 0 0", fontSize: "13px" }}>
          Or{" "}
          <a href={winback.storeOrdersUrl} style={STYLES.link}>
            reorder something from your history
          </a>{" "}
          &mdash; we keep your past designs on file.
        </Text>
      ) : null}

      <Hr style={STYLES.divider} />

      <Text style={STYLES.meta}>
        You&apos;re getting this once because it&apos;s been{" "}
        {Math.round(winback.daysSinceLast)} days since your last order. If
        you&apos;d rather we didn&apos;t reach out again, just reply with
        &ldquo;stop&rdquo; and we&apos;ll mark your record.
      </Text>
    </Base>
  )
}

export default WinbackEmail
