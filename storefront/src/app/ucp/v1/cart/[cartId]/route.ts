import { cancelCart, getCart, updateCart } from "@lib/ucp/operations"
import { readJsonBody, toResponse } from "@lib/ucp/ucp"

type Context = { params: Promise<{ cartId: string }> }

export const GET = async (request: Request, { params }: Context) =>
  toResponse(await getCart(request, (await params).cartId))

export const PUT = async (request: Request, { params }: Context) =>
  toResponse(
    await updateCart(request, (await params).cartId, (await readJsonBody(request)) ?? {})
  )

export const DELETE = async (request: Request, { params }: Context) =>
  toResponse(await cancelCart(request, (await params).cartId))
