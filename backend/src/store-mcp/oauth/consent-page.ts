import type { MedusaResponse } from '@medusajs/framework/http'
import { noStoreHeaders } from './http'
import { oauthPaths } from './urls'

/**
 * The consent page, rendered on the server as one self-contained HTML document: no scripts, no
 * external assets, a hidden field with the signed request token as its only state. It must
 * never be framed, so a page elsewhere cannot overlay it and trick an admin into clicking Allow.
 */

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** What an approved app can and cannot do. docs/store-mcp.md and the admin page say the same. */
export const CAN = [
  'Read products, variants, prices, stock levels, categories and collections',
  'Read orders, and customers limited to name, email, country and order history',
  'Read sales summaries',
  'Create new products as drafts, and edit products while they are drafts',
  'Suggest changes to published products, which wait for you to apply them',
]

export const CANNOT = [
  'Publish, unpublish or delete anything',
  'Change prices or stock on published products',
  'Refund, cancel or edit orders',
  'See addresses, phone numbers or payment details, or export customers',
  'Change store settings, users or API keys',
]

const page = (title: string, body: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; --bg: #f4f4f5; --card: #fff; --text: #18181b; --muted: #52525b; --line: #e4e4e7; --accent: #18181b; --accent-text: #fff; --bad: #b91c1c; --bad-bg: #fef2f2; }
  @media (prefers-color-scheme: dark) { :root { --bg: #09090b; --card: #18181b; --text: #fafafa; --muted: #a1a1aa; --line: #27272a; --accent: #fafafa; --accent-text: #18181b; --bad: #fca5a5; --bad-bg: #450a0a; } }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 48px 16px; background: var(--bg); color: var(--text); font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { width: 100%; max-width: 520px; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 28px; }
  .eyebrow { margin: 0 0 6px; color: var(--muted); font-size: 13px; }
  h1 { margin: 0 0 12px; font-size: 22px; line-height: 1.3; }
  h2 { margin: 20px 0 6px; font-size: 14px; }
  p { margin: 0 0 12px; color: var(--muted); }
  ul { margin: 0; padding-left: 20px; color: var(--muted); }
  li { margin: 2px 0; }
  strong { color: var(--text); }
  .error { margin: 0 0 16px; padding: 10px 12px; border-radius: 8px; background: var(--bad-bg); color: var(--bad); }
  label { display: block; margin: 12px 0 4px; font-size: 13px; font-weight: 600; }
  input[type=email], input[type=password] { width: 100%; padding: 9px 11px; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: var(--text); font: inherit; }
  .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
  button { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--line); background: transparent; color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
  button.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-text); }
  .switch { font-size: 13px; color: var(--muted); }
  a { color: inherit; }
</style>
</head>
<body><main>${body}</main></body>
</html>`

const send = (res: MedusaResponse, status: number, html: string, formActionOrigin?: string): void => {
  // Chrome applies form-action to the redirect that follows the form post, so the app's own
  // origin has to be allowed next to 'self', or Allow would end on a blocked navigation.
  const formAction = ["'self'", formActionOrigin].filter(Boolean).join(' ')
  res
    .set({
      ...noStoreHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': `default-src 'none'; style-src 'unsafe-inline'; form-action ${formAction}; frame-ancestors 'none'; base-uri 'none'`,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      // Not no-referrer: Chrome then sends "Origin: null" on the form post, which the same-origin check refuses
      'Referrer-Policy': 'same-origin',
    })
    .status(status)
    .send(html)
}

export type ConsentPageProps = {
  appName: string
  appUri: string | null
  redirectUri: string
  storeName: string
  requestToken: string
  /** The admin already signed in to the dashboard in this browser, if any */
  sessionAdmin: { email: string; name: string | null } | null
  /** Set when the visitor asked to use another account, or when the session cannot be used */
  showPasswordForm: boolean
  switchAccountHref: string
  error?: string
  email?: string
}

export const renderConsentPage = (res: MedusaResponse, props: ConsentPageProps, status = 200): void => {
  const redirect = new URL(props.redirectUri)
  const list = (items: string[]) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
  const usePassword = props.showPasswordForm || !props.sessionAdmin

  const admin = props.sessionAdmin
  const who = usePassword
    ? `<h2>Sign in with your admin account</h2>
       <label for="email">Email</label>
       <input id="email" name="email" type="email" autocomplete="username" required value="${escapeHtml(props.email ?? '')}">
       <label for="password">Password</label>
       <input id="password" name="password" type="password" autocomplete="current-password" required>`
    : `<p style="margin-top:20px">You are signed in to the dashboard as <strong>${escapeHtml(admin!.name ?? admin!.email)}</strong>${
        admin!.name ? ` (${escapeHtml(admin!.email)})` : ''
      }. <a class="switch" href="${escapeHtml(props.switchAccountHref)}">Use a different account</a></p>`

  const body = `
    <p class="eyebrow">${escapeHtml(props.storeName)} · Store MCP server</p>
    <h1><strong>${escapeHtml(props.appName)}</strong> wants to work on your store as you</h1>
    ${props.error ? `<p class="error" role="alert">${escapeHtml(props.error)}</p>` : ''}
    <p>It will act with your admin account, and only through the tools below.
       You can revoke it at any time under <strong>AI assistants</strong> in the admin.</p>
    <h2>It can</h2>${list(CAN)}
    <h2>It cannot</h2>${list(CANNOT)}
    <form method="post" action="${oauthPaths.authorize}">
      <input type="hidden" name="request" value="${escapeHtml(props.requestToken)}">
      ${who}
      <div class="actions">
        <button type="submit" name="decision" value="deny" formnovalidate>Deny</button>
        <button type="submit" name="decision" value="allow" class="primary">Allow</button>
      </div>
    </form>
    <p class="switch" style="margin-top:16px">After you decide you go back to <strong>${escapeHtml(redirect.host)}</strong>.${
      props.appUri ? ` App website: ${escapeHtml(props.appUri)}` : ''
    }</p>`

  send(res, status, page(`Allow ${props.appName}?`, body), redirect.origin)
}

const KNOWN_REASONS: Record<string, { description: string; title: string }> = {
  expired: {
    title: 'This sign-in request has expired',
    description: 'Go back to the app that asked for access and connect again.',
  },
  unknown_client: {
    title: 'This app is no longer registered',
    description: 'Go back to the app that asked for access and connect again.',
  },
  disabled: {
    title: 'The store MCP server is turned off',
    description: 'The store owner has set STORE_MCP_ENABLED=false on the backend.',
  },
}

/**
 * Shown when an authorization request cannot be trusted enough to send the visitor anywhere:
 * an unknown client or an unregistered redirect URI. Never redirects.
 */
export const renderRequestError = (
  res: MedusaResponse,
  { description, error, reason }: { description?: string; error?: string; reason?: string },
  status = 400
): void => {
  const known = reason ? KNOWN_REASONS[reason] : undefined
  const title = known?.title ?? 'This sign-in request is not valid'
  const text = known?.description ?? description ?? 'Go back to the app that asked for access and try again.'
  send(
    res,
    status,
    page(
      title,
      `<p class="eyebrow">Store MCP server</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p>${
        error ? `<p><code>${escapeHtml(error)}</code></p>` : ''
      }`
    )
  )
}
