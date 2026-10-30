import { completeCheckout } from "@lib/ucp/operations"
import { toResponse } from "@lib/ucp/ucp"

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => toResponse(await completeCheckout(request, (await params).id))
