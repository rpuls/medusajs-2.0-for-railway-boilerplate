import { Hr, Section, Text, Button, Row, Column } from "@react-email/components"

import { Base } from "./base"

export const NPS_REQUEST = "nps-request"

export interface NpsRequestEmailProps {
  nps: {
    firstName: string | null
    orderDisplayId: number | null
    ratingUrls: Array<{ score: number; url: string }>
  }
  preview?: string
}

export const isNpsRequestData = (data: any): data is NpsRequestEmailProps =>
  typeof data?.nps === "object" && Array.isArray(data?.nps?.ratingUrls)

const SCORE_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e",
}

export const NpsRequestEmail = ({ nps, preview }: NpsRequestEmailProps) => {
  const greeting = nps.firstName ? `Hey ${nps.firstName},` : "Hey,"
  const previewText = preview ?? "How did we do?"

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
          How was your SC Prints order
          {nps.orderDisplayId ? ` #${nps.orderDisplayId}` : ""}?
        </Text>

        <Text
          style={{
            margin: "10px 0 0 0",
            fontSize: "15px",
            color: "#1f2937",
            lineHeight: "22px",
          }}
        >
          Two seconds — pick the rating that matches. Goes straight to the team
          and we read every one.
        </Text>

        <Section style={{ margin: "24px 0" }}>
          <Row>
            {nps.ratingUrls.map(({ score, url }) => (
              <Column key={score} align="center" style={{ padding: "0 4px" }}>
                <Button
                  href={url}
                  style={{
                    background: SCORE_COLORS[score] ?? "#737373",
                    color: "#ffffff",
                    padding: "16px 0",
                    fontSize: "20px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    textDecoration: "none",
                    display: "inline-block",
                    width: "56px",
                    textAlign: "center",
                  }}
                >
                  {score}
                </Button>
              </Column>
            ))}
          </Row>
          <Row style={{ marginTop: "8px" }}>
            <Column align="left" style={{ paddingLeft: "4px" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#737373",
                }}
              >
                Disappointing
              </Text>
            </Column>
            <Column align="right" style={{ paddingRight: "4px" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#737373",
                }}
              >
                Loved it
              </Text>
            </Column>
          </Row>
        </Section>

        <Hr style={{ margin: "24px 0", borderColor: "#e5e5e5" }} />

        <Text
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#737373",
            lineHeight: "18px",
          }}
        >
          We send this once per order, never more than once a quarter to the
          same person. If something went wrong, hit reply and we'll fix it.
        </Text>
      </Section>
    </Base>
  )
}

export default NpsRequestEmail
