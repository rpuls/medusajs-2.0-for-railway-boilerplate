import { searchCatalog } from "@lib/ucp/operations"
import { readJsonBody, toResponse } from "@lib/ucp/ucp"

export const POST = async (request: Request) =>
  toResponse(await searchCatalog(request, (await readJsonBody(request)) ?? {}))
