import LoginTemplate from "@modules/account/templates/login-template"

/**
 * Parallel-route fallback. Next.js renders every slot for every URL — if a
 * slot has no matching `page.tsx` for the current segment AND no
 * `default.tsx`, the whole route 404s. /account has @dashboard/<sub-route>
 * pages but no matching `@login/<sub-route>` pages, so deep-linking to
 * e.g. /account/orders used to 404 the entire page (including the
 * dashboard slot that DID match).
 *
 * This default renders the login form, so an unauthenticated visitor
 * deep-linking to /account/orders sees "sign in" instead of 404. For
 * authenticated visitors the layout discards this slot entirely.
 */
export default function LoginDefault() {
  return <LoginTemplate />
}
