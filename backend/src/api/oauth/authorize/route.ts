import { authorizeDecision, authorizePage, whenEnabled } from '../../../store-mcp/oauth/endpoints'

/** The consent page an AI app sends the admin to, and the form it posts back. */
export const GET = whenEnabled(authorizePage)
export const POST = whenEnabled(authorizeDecision)
