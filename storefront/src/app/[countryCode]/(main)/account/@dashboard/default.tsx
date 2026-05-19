/**
 * Parallel-route fallback. Every current /account/* path has a matching
 * @dashboard/<segment>/page.tsx so this should rarely render — but
 * without it, any future deep-link (or a stale link) that doesn't match
 * a dashboard sub-route would 404 the entire account layout.
 *
 * Returning null is fine here: the layout only renders this slot when
 * the customer is authenticated, and the @login slot's default takes
 * over for unauthed visitors.
 */
export default function DashboardDefault() {
  return null
}
