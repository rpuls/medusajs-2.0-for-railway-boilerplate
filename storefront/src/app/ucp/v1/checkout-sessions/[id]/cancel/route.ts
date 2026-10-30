import { cancelCheckout } from "@lib/ucp/operations"
import { toResponse } from "@lib/ucp/ucp"

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => toResponse(await cancelCheckout(request, (await params).id))
