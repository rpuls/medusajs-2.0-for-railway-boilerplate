import { Hr, Section, Text } from "@react-email/components"

import { Base } from "./base"
import type { MonthlyDigestPayload } from "../../../services/monthly-digest/build-digest"

export const MONTHLY_DIGEST = "monthly-digest"

export interface MonthlyDigestEmailProps {
  digest: MonthlyDigestPayload
  adminUrl?: string
  preview?: string
}

export const isMonthlyDigestData = (
  data: any
): data is MonthlyDigestEmailProps =>
  typeof data?.digest === "object" &&
  typeof data?.digest?.period === "object" &&
  typeof data?.digest?.headline === "object"

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

const formatDelta = (
  d: number | null,
  goodIfPositive = true
): { label: string; color: string } => {
  if (d === null) return { label: "—", color: "#737373" }
  const sign = d > 0 ? "+" : ""
  const labelStr = `${sign}${d.toFixed(1)}%`
  const positive = d >= 0
  const isGood = goodIfPositive ? positive : !positive
  if (Math.abs(d) < 1) return { label: labelStr, color: "#737373" }
  return { label: labelStr, color: isGood ? "#059669" : "#dc2626" }
}

const KpiRow = ({
  label,
  value,
  delta,
}: {
  label: string
  value: string
  delta: { label: string; color: string }
}) => (
  <Section
    style={{
      borderBottom: "1px solid #e5e5e5",
      padding: "10px 0",
    }}
  >
    <Text
      style={{
        margin: 0,
        fontSize: "12px",
        color: "#737373",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        margin: "2px 0 0 0",
        fontSize: "22px",
        fontWeight: 600,
        color: "#111111",
      }}
    >
      {value}
      <span
        style={{
          marginLeft: "10px",
          fontSize: "13px",
          fontWeight: 500,
          color: delta.color,
        }}
      >
        {delta.label}
      </span>
    </Text>
  </Section>
)

export const MonthlyDigestEmail = ({
  digest,
  adminUrl,
  preview,
}: MonthlyDigestEmailProps) => {
  const previewText =
    preview ?? `${digest.period.label} performance summary for SC Prints.`
  const currency = digest.currency_code || "AUD"

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
          SC Prints monthly digest
        </Text>
        <Text
          style={{
            margin: "4px 0 18px 0",
            fontSize: "24px",
            fontWeight: 700,
            color: "#111111",
          }}
        >
          {digest.period.label}
        </Text>

        {digest.highlights.length > 0 ? (
          <Section
            style={{
              background: "#f5f5f4",
              padding: "12px 14px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {digest.highlights.map((h, i) => (
              <Text
                key={i}
                style={{
                  margin: i === 0 ? 0 : "6px 0 0 0",
                  fontSize: "14px",
                  color: "#1f2937",
                }}
              >
                • {h}
              </Text>
            ))}
          </Section>
        ) : null}

        <Text
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            fontWeight: 600,
            color: "#111111",
          }}
        >
          Headline
        </Text>
        <KpiRow
          label="Revenue"
          value={formatCurrency(digest.headline.revenue.current, currency)}
          delta={formatDelta(digest.headline.revenue.delta_pct)}
        />
        <KpiRow
          label="Orders"
          value={digest.headline.orders.current.toLocaleString("en-AU")}
          delta={formatDelta(digest.headline.orders.delta_pct)}
        />
        <KpiRow
          label="AOV"
          value={formatCurrency(digest.headline.aov.current, currency)}
          delta={formatDelta(digest.headline.aov.delta_pct)}
        />
        <KpiRow
          label="Distinct customers"
          value={digest.headline.distinct_customers.current.toLocaleString(
            "en-AU"
          )}
          delta={formatDelta(digest.headline.distinct_customers.delta_pct)}
        />
        <KpiRow
          label="New customers"
          value={digest.headline.new_customers.current.toLocaleString("en-AU")}
          delta={formatDelta(digest.headline.new_customers.delta_pct)}
        />

        <Hr style={{ margin: "20px 0", borderColor: "#e5e5e5" }} />

        {digest.top_products.length > 0 ? (
          <>
            <Text
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: 600,
                color: "#111111",
              }}
            >
              Top products
            </Text>
            {digest.top_products.map((p, i) => (
              <Section
                key={i}
                style={{
                  borderBottom: "1px solid #e5e5e5",
                  padding: "8px 0",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#111111",
                  }}
                >
                  {p.title}
                </Text>
                <Text
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "12px",
                    color: "#737373",
                  }}
                >
                  {p.quantity} sold · {formatCurrency(p.revenue, currency)}
                </Text>
              </Section>
            ))}
            <Hr style={{ margin: "20px 0", borderColor: "#e5e5e5" }} />
          </>
        ) : null}

        <Text
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            fontWeight: 600,
            color: "#111111",
          }}
        >
          Customer segments
        </Text>
        <Text
          style={{
            margin: "0 0 4px 0",
            fontSize: "13px",
            color: "#1f2937",
          }}
        >
          Champions: <strong>{digest.rfm_movers.champions}</strong>
          {" · "}New: <strong>{digest.rfm_movers.new_customer}</strong>
          {" · "}At Risk: <strong>{digest.rfm_movers.at_risk}</strong>
          {" · "}Hibernating: <strong>{digest.rfm_movers.hibernating}</strong>
        </Text>

        <Hr style={{ margin: "20px 0", borderColor: "#e5e5e5" }} />

        <Text
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            fontWeight: 600,
            color: "#111111",
          }}
        >
          Production health
        </Text>
        <Text
          style={{
            margin: "0 0 4px 0",
            fontSize: "13px",
            color: "#1f2937",
          }}
        >
          {digest.production.transitions} transitions completed,{" "}
          <strong
            style={{
              color:
                digest.production.breach_pct > 25
                  ? "#dc2626"
                  : digest.production.breach_pct > 10
                    ? "#d97706"
                    : "#059669",
            }}
          >
            {digest.production.breach_pct.toFixed(1)}% breached SLA
          </strong>
          {digest.production.severe_breaches > 0
            ? ` (${digest.production.severe_breaches} severe)`
            : ""}
          .
        </Text>
        {digest.production.currently_breaching > 0 ? (
          <Text
            style={{
              margin: "0 0 4px 0",
              fontSize: "13px",
              color: "#dc2626",
            }}
          >
            ⚠ {digest.production.currently_breaching} order
            {digest.production.currently_breaching === 1 ? " is" : "s are"}{" "}
            currently past SLA — check the Production page.
          </Text>
        ) : null}

        <Hr style={{ margin: "20px 0", borderColor: "#e5e5e5" }} />

        <Text
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            fontWeight: 600,
            color: "#111111",
          }}
        >
          Inventory
        </Text>
        <Text
          style={{
            margin: "0 0 4px 0",
            fontSize: "13px",
            color: "#1f2937",
          }}
        >
          Out of stock: <strong>{digest.inventory.out_of_stock_variants}</strong> variants ·
          Aging (90-180d): <strong>{digest.inventory.aging_units}</strong> units ·
          Dead (180d+): <strong>{digest.inventory.dead_units}</strong> units
        </Text>

        {adminUrl ? (
          <>
            <Hr style={{ margin: "20px 0", borderColor: "#e5e5e5" }} />
            <Text
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#737373",
              }}
            >
              <a
                href={`${adminUrl}/app/reports`}
                style={{ color: "#1f2937" }}
              >
                Open the full Reports page →
              </a>
            </Text>
          </>
        ) : null}
      </Section>
    </Base>
  )
}

export default MonthlyDigestEmail
