import { handleMcpRequest } from "@lib/ucp/mcp"

export const POST = (request: Request) => handleMcpRequest(request)

// The spec lets a stateless server refuse the GET that would open a stream.
export const GET = () =>
  new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } })
