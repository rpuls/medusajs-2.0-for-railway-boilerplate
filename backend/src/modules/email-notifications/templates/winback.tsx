import { Hr, Section, Text, Button } from "@react-email/components"

import { Base } from "./base"
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

export const WinbackEmail = ({ winback, preview }: WinbackEmailProps) => {
  const greeting = winback.firstName ? `Hey ${winback.firstName},` : "Hey,"
  const copy = COPY_BY_SEVERITY[winback.severity]
  const previewText = preview ?? copy.headline

  const ctaUrl = winback.customizerUrl ?? winback.storefrontUrl

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
            fontSize: "16px",
            fontWeight: 600,
            color: "#111111",
          }}
        >
          {copy.headline}
        </Text>

        <Text
          style={{
            margin: "10px 0 0 0",
            fontSize: "15px",
            color: "#1f2937",
            lineHeight: "22px",
          }}
        >
          {copy.body}
        </Text>

        {ctaUrl ? (
          <Section style={{ margin: "20px 0" }}>
            <Button
              href={ctaUrl}
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
              Start a new design →
            </Button>
          </Section>
        ) : null}

        {winback.storeOrdersUrl ? (
          <Text
            style={{
              margin: "10px 0 0 0",
              fontSize: "13px",
              color: "#737373",
            }}
          >
            Or{" "}
            <a
              href={winback.storeOrdersUrl}
              style={{ color: "#111111", textDecoration: "underline" }}
            >
              reorder something from your history
            </a>{" "}
            — we keep your past designs on file.
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
          You're getting this once because it's been{" "}
          {Math.round(winback.daysSinceLast)} days since your last order. If
          you'd rather we didn't reach out again, just reply with "stop" and
          we'll mark your record.
        </Text>
      </Section>
    </Base>
  )
}

export default WinbackEmail
