import { createCheckout } from "@lib/ucp/operations"
import { readJsonBody, toResponse } from "@lib/ucp/ucp"

export const POST = async (request: Request) =>
  toResponse(
    await createCheckout(
      request,
      (await readJsonBody(request)) ?? {},
      request.headers.get("idempotency-key")
    )
  )
