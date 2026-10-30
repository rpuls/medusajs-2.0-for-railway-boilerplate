import { token, whenEnabled } from '../../../store-mcp/oauth/endpoints'
import { preflight } from '../../../store-mcp/oauth/http'

export const POST = whenEnabled(token)
export const OPTIONS = whenEnabled(preflight)
