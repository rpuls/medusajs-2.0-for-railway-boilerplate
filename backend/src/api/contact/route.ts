import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INotificationModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { Pool } from "pg"
import { ulid } from "ulid"
import { CONTACT_NOTIFICATION_EMAIL, DATABASE_URL } from "../../lib/constants"
import { isValidEmail } from "../../lib/email-validation"
import { getPostHog } from "../../lib/posthog"
import { EmailTemplates } from "../../modules/email-notifications/templates"

const DEFAULT_ALLOWED_ORIGINS = [
  "https://medusajs-2-0-for-railway-vercel.vercel.app",
  "http://localhost:8000",
]

const contactSubmissionPool = new Pool({
  connectionString: DATABASE_URL,
})

let ensureContactSubmissionsTablePromise: Promise<void> | null = null

type ContactSubmissionInput = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  subject: string | null
  message: string
  sourceOrigin: string | null
  sourceIp: string | null
  userAgent: string | null
}

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

async function ensureContactSubmissionsTable() {
  if (!ensureContactSubmissionsTablePromise) {
    ensureContactSubmissionsTablePromise = (async () => {
      await contactSubmissionPool.query(`
        CREATE TABLE IF NOT EXISTS contact_submissions (
          id TEXT PRIMARY KEY,
          first_name TEXT,
          last_name TEXT,
          email TEXT NOT NULL,
          subject TEXT,
          message TEXT NOT NULL,
          source_origin TEXT,
          source_ip TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
    })()
  }

  await ensureContactSubmissionsTablePromise
}

async function createContactSubmission(input: ContactSubmissionInput) {
  await ensureContactSubmissionsTable()

  await contactSubmissionPool.query(
    `
      INSERT INTO contact_submissions (
        id,
        first_name,
        last_name,
        email,
        subject,
        message,
        source_origin,
        source_ip,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      input.id,
      input.firstName,
      input.lastName,
      input.email,
      input.subject,
      input.message,
      input.sourceOrigin,
      input.sourceIp,
      input.userAgent,
    ]
  )
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  setManualCors(req, res)
  return res.status(204).send()
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  setManualCors(req, res)

  const body = (req.body ?? {}) as Record<string, unknown>
  const firstName = typeof body.first_name === "string" ? body.first_name.trim() : null
  const lastName = typeof body.last_name === "string" ? body.last_name.trim() : null
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const subject = typeof body.subject === "string" ? body.subject.trim() : null
  const message = typeof body.message === "string" ? body.message.trim() : ""

  if (!email || !message) {
    return res.status(400).json({
      success: false,
      message: "Email and message are required",
    })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    })
  }

  const submissionId = ulid()
  const sourceIpHeader = req.headers["x-forwarded-for"]
  const sourceIp = Array.isArray(sourceIpHeader)
    ? sourceIpHeader[0] ?? null
    : sourceIpHeader?.split(",")?.[0]?.trim() ?? null
  const sourceOrigin = req.headers.origin ?? null
  const userAgent = req.headers["user-agent"] ?? null

  try {
    await createContactSubmission({
      id: submissionId,
      firstName,
      lastName,
      email,
      subject,
      message,
      sourceOrigin,
      sourceIp,
      userAgent,
    })
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to persist contact submission: ${error instanceof Error ? error.message : "unknown error"}`
    )
  }

  const notificationRecipient = CONTACT_NOTIFICATION_EMAIL?.trim()

  if (notificationRecipient) {
    try {
      const notificationModuleService: INotificationModuleService = req.scope.resolve(Modules.NOTIFICATION)

      await notificationModuleService.createNotifications({
        to: notificationRecipient,
        channel: "email",
        template: EmailTemplates.CONTACT_SUBMISSION,
        data: {
          emailOptions: {
            subject: subject
              ? `New contact submission: ${subject}`
              : "New contact form submission",
            replyTo: email,
          },
          submission: {
            id: submissionId,
            firstName,
            lastName,
            email,
            subject,
            message,
            sourceOrigin,
            sourceIp,
            userAgent,
          },
          preview: "A new contact form submission was received.",
        },
      })
    } catch (error) {
      console.error("Failed to send contact submission notification", error)
    }
  } else {
    console.warn("CONTACT_NOTIFICATION_EMAIL is not configured; contact notification email skipped")
  }

  console.log("Contact submission received", { submissionId, email, subject })

  getPostHog()?.capture({
    distinctId: email,
    event: "contact form submitted",
    properties: {
      submission_id: submissionId,
      subject: subject ?? null,
      source_origin: sourceOrigin ?? null,
      $set: { email },
    },
  })

  return res.status(200).json({
    success: true,
    message: "Data received by backend",
    id: submissionId,
  })
}