import { getCheckout, updateCheckout } from "@lib/ucp/operations"
import { readJsonBody, toResponse } from "@lib/ucp/ucp"

type Context = { params: Promise<{ id: string }> }

export const GET = async (request: Request, { params }: Context) =>
  toResponse(await getCheckout(request, (await params).id))

export const PUT = async (request: Request, { params }: Context) =>
  toResponse(
    await updateCheckout(request, (await params).id, (await readJsonBody(request)) ?? {})
  )
