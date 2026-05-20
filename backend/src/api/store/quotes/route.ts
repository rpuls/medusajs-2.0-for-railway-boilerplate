import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { ulid } from "ulid"
import { z } from "zod"

import {
  CONTACT_NOTIFICATION_EMAIL,
  SUPPORT_REPLY_TO_EMAIL,
} from "../../../lib/constants"
import { isValidEmail } from "../../../lib/email-validation"
import { getPostHog } from "../../../lib/posthog"
import { getStorefrontOriginAllowlist } from "../../../lib/storefront-origins"
import { EmailTemplates } from "../../../modules/email-notifications/templates"
import { QUOTE_MODULE } from "../../../modules/quote"
import type QuoteModuleService from "../../../modules/quote/service"

function getAllowedOrigins() {
  return new Set(getStorefrontOriginAllowlist())
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

const moodBoardImageSchema = z.object({
  filename: z.string().min(1).max(200),
  mime_type: z.string().min(1).max(80),
  data_base64: z.string().min(1),
})

const bodySchema = z.object({
  email: z.string().min(3),
  contact_name: z.string().max(120).optional(),
  contact_phone: z.string().max(40).optional(),
  company: z.string().max(120).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(8000),
  source: z.enum(["byo", "contact"]).optional(),
  line_items: z
    .array(
      z.object({
        title: z.string().max(200),
        description: z.string().max(500).optional(),
        quantity: z.coerce.number().int().min(0).optional(),
      })
    )
    .max(50)
    .optional(),
  /** Up to 5 inspiration images uploaded as data URLs. The route
   *  uploads them via the file module and stores the resulting URLs
   *  on the quote's metadata.mood_board_urls. */
  mood_board: z.array(moodBoardImageSchema).max(5).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  setManualCors(req, res)
  return res.status(204).send()
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  setManualCors(req, res)

  let parsed: z.infer<typeof bodySchema>
  try {
    parsed = bodySchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err?.message ?? "Invalid request",
    })
  }

  const email = parsed.email.trim().toLowerCase()
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter a valid email address." })
  }

  const quoteService = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)

  const publicId = `Q-${ulid().slice(-10).toUpperCase()}`
  const lineItems = (parsed.line_items ?? []).map((li) => ({
    title: li.title,
    description: li.description ?? null,
    quantity: li.quantity ?? null,
    unit_price: null,
    total: null,
  }))

  // ---- Mood board uploads ----
  const moodBoardUrls: string[] = []
  if (parsed.mood_board?.length) {
    try {
      const fileModuleService = req.scope.resolve(Modules.FILE) as any
      for (const img of parsed.mood_board) {
        if (!img.mime_type.startsWith("image/")) continue
        const base64 = img.data_base64.replace(/^data:[^;]+;base64,/, "")
        const buf = Buffer.from(base64, "base64")
        if (buf.byteLength > 8 * 1024 * 1024) continue // 8 MB ceiling
        const safeName = `mood-board/${publicId}/${Date.now()}-${img.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`
        const [uploaded] = await fileModuleService.createFiles([
          { filename: safeName, mimeType: img.mime_type, content: base64 },
        ])
        if (uploaded?.url) moodBoardUrls.push(uploaded.url)
      }
    } catch (err) {
      console.error("Mood board upload failed", err)
      // Soft-fail — the quote should still create even if uploads fail.
    }
  }

  const [quote] = await quoteService.createQuotes([
    {
      public_id: publicId,
      status: "new",
      source: parsed.source ?? "byo",
      email,
      contact_name: parsed.contact_name ?? null,
      contact_phone: parsed.contact_phone ?? null,
      company: parsed.company ?? null,
      subject: parsed.subject ?? null,
      message: parsed.message,
      line_items: { items: lineItems },
      metadata: {
        ...(parsed.metadata ?? {}),
        ...(moodBoardUrls.length ? { mood_board_urls: moodBoardUrls } : {}),
      },
    },
  ])

  await quoteService.createQuoteEvents([
    {
      quote_id: quote.id,
      type: "created",
      actor: email,
      body: { source: parsed.source ?? "byo", public_id: publicId },
    },
  ])

  const notificationRecipient = CONTACT_NOTIFICATION_EMAIL?.trim()
  if (notificationRecipient) {
    try {
      const notificationModuleService: INotificationModuleService = req.scope.resolve(
        Modules.NOTIFICATION
      )
      await notificationModuleService.createNotifications({
        to: notificationRecipient,
        channel: "email",
        template: EmailTemplates.CONTACT_SUBMISSION,
        data: {
          emailOptions: {
            subject: `New quote request ${publicId}${parsed.subject ? `: ${parsed.subject}` : ""}`,
            replyTo: email,
          },
          submission: {
            id: quote.id,
            firstName: parsed.contact_name ?? null,
            lastName: null,
            email,
            subject: parsed.subject ?? null,
            message: parsed.message,
            sourceOrigin: req.headers.origin ?? null,
            sourceIp: null,
            userAgent: req.headers["user-agent"] ?? null,
          },
          preview: `Quote ${publicId}`,
        },
      })
    } catch (err) {
      console.error("Quote notification failed", err)
    }
  }

  getPostHog()?.capture({
    distinctId: email,
    event: "quote requested",
    properties: {
      quote_id: quote.id,
      public_id: publicId,
      source: parsed.source ?? "byo",
      line_count: lineItems.length,
      $set: { email },
    },
  })

  return res.status(201).json({
    success: true,
    quote_id: quote.id,
    public_id: publicId,
    reply_to: SUPPORT_REPLY_TO_EMAIL ?? null,
  })
}
