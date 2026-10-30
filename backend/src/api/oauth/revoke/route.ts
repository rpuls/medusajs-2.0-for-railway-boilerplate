import { revoke, whenEnabled } from '../../../store-mcp/oauth/endpoints'
import { preflight } from '../../../store-mcp/oauth/http'

export const POST = whenEnabled(revoke)
export const OPTIONS = whenEnabled(preflight)
