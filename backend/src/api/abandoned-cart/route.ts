import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { Pool } from "pg"
import { ulid } from "ulid"

import { CONTACT_NOTIFICATION_EMAIL, DATABASE_URL, SUPPORT_REPLY_TO_EMAIL } from "../../lib/constants"
import { getPostHog } from "../../lib/posthog"
import { EmailTemplates } from "../../modules/email-notifications/templates"

const DEFAULT_ALLOWED_ORIGINS = [
  "https://medusajs-2-0-for-railway-vercel.vercel.app",
  "http://localhost:8000",
]

const abandonedCartPool = new Pool({
  connectionString: DATABASE_URL,
})

let ensureAbandonedCartTablePromise: Promise<void> | null = null

function getAllowedOrigins() {
  const configuredStoreCors = (process.env.STORE_CORS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredStoreCors])
}

function setManualCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = req.headers.origin
  const allowedOrigins = getAllowedOrigins()

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  }

  res.setHeader("Vary", "Origin")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-publishable-api-key")
  res.setHeader("Access-Control-Allow-Credentials", "true")
}

async function ensureAbandonedCartTable() {
  if (!ensureAbandonedCartTablePromise) {
    ensureAbandonedCartTablePromise = (async () => {
      await abandonedCartPool.query(`
        CREATE TABLE IF NOT EXISTS abandoned_cart_followups (
          id TEXT PRIMARY KEY,
          cart_id TEXT NOT NULL,
          email TEXT NOT NULL,
          country_code TEXT,
          currency_code TEXT,
          cart_total BIGINT,
          item_count INTEGER NOT NULL DEFAULT 0,
          items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
          source_origin TEXT,
          source_ip TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (cart_id, email)
        )
      `)
    })()
  }

  await ensureAbandonedCartTablePromise
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  setManualCors(req, res)
  return res.status(204).send()
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  setManualCors(req, res)

  const body = (req.body ?? {}) as Record<string, unknown>
  const cartId = typeof body.cart_id === "string" ? body.cart_id.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const countryCode = typeof body.country_code === "string" ? body.country_code.trim() : null
  const currencyCode = typeof body.currency_code === "string" ? body.currency_code.trim() : null
  const cartTotal =
    typeof body.cart_total === "number" && Number.isFinite(body.cart_total)
      ? Math.round(body.cart_total)
      : null
  const itemCount =
    typeof body.item_count === "number" && Number.isFinite(body.item_count)
      ? Math.max(0, Math.floor(body.item_count))
      : 0
  const items =
    Array.isArray(body.items) && body.items.length
      ? body.items.filter((item) => item && typeof item === "object")
      : []
  const notifyCustomer = body.notify_customer === true

  if (!cartId || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid cart_id and email are required.",
    })
  }

  const sourceIpHeader = req.headers["x-forwarded-for"]
  const sourceIp = Array.isArray(sourceIpHeader)
    ? sourceIpHeader[0] ?? null
    : sourceIpHeader?.split(",")?.[0]?.trim() ?? null
  const sourceOrigin = req.headers.origin ?? null
  const userAgent = req.headers["user-agent"] ?? null

  await ensureAbandonedCartTable()

  await abandonedCartPool.query(
    `
      INSERT INTO abandoned_cart_followups (
        id,
        cart_id,
        email,
        country_code,
        currency_code,
        cart_total,
        item_count,
        items_snapshot,
        source_origin,
        source_ip,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)
      ON CONFLICT (cart_id, email)
      DO UPDATE SET
        country_code = EXCLUDED.country_code,
        currency_code = EXCLUDED.currency_code,
        cart_total = EXCLUDED.cart_total,
        item_count = EXCLUDED.item_count,
        items_snapshot = EXCLUDED.items_snapshot,
        source_origin = EXCLUDED.source_origin,
        source_ip = EXCLUDED.source_ip,
        user_agent = EXCLUDED.user_agent,
        updated_at = NOW()
    `,
    [
      ulid(),
      cartId,
      email,
      countryCode,
      currencyCode,
      cartTotal,
      itemCount,
      JSON.stringify(items),
      sourceOrigin,
      sourceIp,
      userAgent,
    ]
  )

  if (notifyCustomer) {
    try {
      const notificationModuleService: INotificationModuleService = req.scope.resolve(Modules.NOTIFICATION)
      const supportRecipient = CONTACT_NOTIFICATION_EMAIL?.trim()
      const recipients = supportRecipient && supportRecipient !== email
        ? [email, supportRecipient]
        : [email]
      for (const recipient of recipients) {
        await notificationModuleService.createNotifications({
          to: recipient,
          channel: "email",
          template: EmailTemplates.CART_REMINDER,
          data: {
            emailOptions: {
              subject: "Your SC PRINTS cart reminder",
              replyTo: supportRecipient || SUPPORT_REPLY_TO_EMAIL,
            },
            reminder: {
              cartId,
              email,
              itemCount,
              currencyCode,
              cartTotal,
              countryCode,
              items: items.map((item: any) => ({
                title: typeof item?.title === "string" ? item.title : null,
                quantity: typeof item?.quantity === "number" ? item.quantity : null,
              })),
            },
            preview: "Your cart is saved and ready when you are.",
          },
        })
      }
    } catch (error) {
      console.error("Failed to send cart reminder notification", error)
    }
  }

  getPostHog()?.capture({
    distinctId: email,
    event: "abandoned cart captured",
    properties: {
      cart_id: cartId,
      item_count: itemCount,
      cart_total: cartTotal,
      currency_code: currencyCode ?? null,
      country_code: countryCode ?? null,
      notify_customer: notifyCustomer,
      $set: { email },
    },
  })

  return res.status(200).json({
    success: true,
    message: notifyCustomer
      ? "Cart saved. Reminder email sent."
      : "Cart follow-up details saved.",
  })
}
