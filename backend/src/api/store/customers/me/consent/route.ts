import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { ICustomerModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import { getPostHog } from "../../../../../lib/posthog"

const CONSENT_KEYS = [
  "marketing_consent_email",
  "marketing_consent_sms",
  "marketing_consent_retargeting",
] as const

type ConsentKey = (typeof CONSENT_KEYS)[number]

const updateBodySchema = z.object({
  marketing_consent_email: z.boolean().optional(),
  marketing_consent_sms: z.boolean().optional(),
  marketing_consent_retargeting: z.boolean().optional(),
})

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

function readConsentFromMetadata(metadata: Record<string, unknown> | null | undefined) {
  const m = metadata ?? {}
  return {
    marketing_consent_email:
      typeof m.marketing_consent_email === "boolean"
        ? m.marketing_consent_email
        : null,
    marketing_consent_sms:
      typeof m.marketing_consent_sms === "boolean" ? m.marketing_consent_sms : null,
    marketing_consent_retargeting:
      typeof m.marketing_consent_retargeting === "boolean"
        ? m.marketing_consent_retargeting
        : null,
    marketing_consent_updated_at:
      typeof m.marketing_consent_updated_at === "string"
        ? m.marketing_consent_updated_at
        : null,
    marketing_consent_source:
      typeof m.marketing_consent_source === "string"
        ? m.marketing_consent_source
        : null,
  }
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const customerModuleService: ICustomerModuleService = req.scope.resolve(
    Modules.CUSTOMER
  )

  const customer = await customerModuleService.retrieveCustomer(customerId)
  res.json(readConsentFromMetadata(customer.metadata as Record<string, unknown>))
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const body = updateBodySchema.parse(req.body ?? {})

  const patch: Record<string, unknown> = {}
  for (const key of CONSENT_KEYS) {
    if (typeof body[key] === "boolean") {
      patch[key] = body[key]
    }
  }
  if (Object.keys(patch).length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Provide at least one consent flag to update."
    )
  }
  patch.marketing_consent_updated_at = new Date().toISOString()
  patch.marketing_consent_source = "profile"

  const customerModuleService: ICustomerModuleService = req.scope.resolve(
    Modules.CUSTOMER
  )
  await customerModuleService.updateCustomers(customerId, { metadata: patch })

  const customer = await customerModuleService.retrieveCustomer(customerId)
  const consent = readConsentFromMetadata(
    customer.metadata as Record<string, unknown>
  )

  getPostHog()?.capture({
    distinctId: customerId,
    event: "consent_changed",
    properties: {
      ...consent,
      source: "profile",
    },
  })

  res.json(consent)
}
