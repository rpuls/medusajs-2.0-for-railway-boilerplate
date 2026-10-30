import { whenEnabled } from '../../store-mcp/oauth/endpoints'
import { preflight } from '../../store-mcp/oauth/http'
import { handleMcpRequest, methodNotAllowed } from '../../store-mcp/server'

/** The store MCP server. See docs/store-mcp.md. */
export const POST = whenEnabled(handleMcpRequest)
export const GET = whenEnabled(methodNotAllowed)
export const DELETE = whenEnabled(methodNotAllowed)
export const OPTIONS = whenEnabled(preflight)
