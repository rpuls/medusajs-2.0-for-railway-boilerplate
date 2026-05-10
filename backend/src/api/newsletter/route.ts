import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { Pool } from "pg"
import { ulid } from "ulid"
import {
  CONTACT_NOTIFICATION_EMAIL,
  DATABASE_URL,
  NEWSLETTER_NOTIFICATION_EMAIL,
} from "../../lib/constants"
import { isValidEmail } from "../../lib/email-validation"
import { parseNotificationEmailList } from "../../lib/notification-recipients"
import { getPostHog } from "../../lib/posthog"
import { EmailTemplates } from "../../modules/email-notifications/templates"

const DEFAULT_ALLOWED_ORIGINS = [
  "https://medusajs-2-0-for-railway-vercel.vercel.app",
  "http://localhost:8000",
]

const newsletterPool = new Pool({
  connectionString: DATABASE_URL,
})

let ensureNewsletterTablePromise: Promise<void> | null = null

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

async function ensureNewsletterTable() {
  if (!ensureNewsletterTablePromise) {
    ensureNewsletterTablePromise = (async () => {
      await newsletterPool.query(`
        CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          source_origin TEXT,
          source_ip TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
    })()
  }

  await ensureNewsletterTablePromise
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  setManualCors(req, res)
  return res.status(204).send()
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  setManualCors(req, res)

  const body = (req.body ?? {}) as Record<string, unknown>
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    })
  }

  const sourceIpHeader = req.headers["x-forwarded-for"]
  const sourceIp = Array.isArray(sourceIpHeader)
    ? sourceIpHeader[0] ?? null
    : sourceIpHeader?.split(",")?.[0]?.trim() ?? null
  const sourceOrigin = req.headers.origin ?? null
  const userAgent = req.headers["user-agent"] ?? null

  await ensureNewsletterTable()

  const result = await newsletterPool.query(
    `
      INSERT INTO newsletter_subscriptions (
        id,
        email,
        source_origin,
        source_ip,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `,
    [ulid(), email, sourceOrigin, sourceIp, userAgent]
  )

  if (result.rowCount === 0) {
    return res.status(200).json({
      success: true,
      message: "You're already subscribed.",
    })
  }

  const subscriptionId = (result.rows[0] as { id?: string })?.id ?? ulid()
  const teamRecipients = parseNotificationEmailList(
    NEWSLETTER_NOTIFICATION_EMAIL || CONTACT_NOTIFICATION_EMAIL
  )

  if (teamRecipients.length) {
    try {
      const notificationModuleService: INotificationModuleService = req.scope.resolve(
        Modules.NOTIFICATION
      )
      for (const inbox of teamRecipients) {
        await notificationModuleService.createNotifications({
          to: inbox,
          channel: "email",
          template: EmailTemplates.CONTACT_SUBMISSION,
          data: {
            emailOptions: {
              subject: "New newsletter subscriber",
              replyTo: email,
            },
            submission: {
              id: subscriptionId,
              firstName: null,
              lastName: null,
              email,
              subject: "Newsletter subscription",
              message: `New newsletter subscriber:\n${email}`,
              sourceOrigin,
              sourceIp,
              userAgent,
            },
            preview: "A new newsletter subscription was received.",
          },
        })
      }
    } catch (error) {
      console.error("Failed to send newsletter subscription notification", error)
    }
  }

  getPostHog()?.capture({
    distinctId: email,
    event: "newsletter subscribed",
    properties: {
      subscription_id: subscriptionId,
      source_origin: sourceOrigin ?? null,
      $set: { email },
    },
  })

  return res.status(200).json({
    success: true,
    message: "Thanks for subscribing!",
  })
}
