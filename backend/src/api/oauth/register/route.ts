import { register, whenEnabled } from '../../../store-mcp/oauth/endpoints'
import { preflight } from '../../../store-mcp/oauth/http'

export const POST = whenEnabled(register)
export const OPTIONS = whenEnabled(preflight)
