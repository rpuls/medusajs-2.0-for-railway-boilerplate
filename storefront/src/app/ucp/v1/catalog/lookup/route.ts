import { lookupCatalog } from "@lib/ucp/operations"
import { readJsonBody, toResponse } from "@lib/ucp/ucp"

export const POST = async (request: Request) =>
  toResponse(await lookupCatalog(request, (await readJsonBody(request)) ?? {}))
