import { Metadata } from "next"

import EmailPreferencesForm from "@modules/account/components/email-preferences-form"

export const metadata: Metadata = {
  title: "Email preferences",
  description: "Manage which SC PRINTS emails you receive.",
  robots: { index: false, follow: false },
}

type SearchParams = {
  email?: string
  kind?: string
  sig?: string
  unsubscribed?: string
}

/**
 * Customer-facing email preference center. Loaded after a one-click
 * unsubscribe (which forwards the signed token via query params) or
 * any "manage your preferences" link in marketing emails.
 *
 * Server component reads the query params and hands them to a client
 * component that fetches state + posts updates. No customer session
 * required — the signed token in the URL is the only auth.
 */
export default async function EmailPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const email = params.email ?? ""
  const kind = params.kind ?? "all"
  const sig = params.sig ?? ""
  const justUnsubscribed = params.unsubscribed === "1"

  const hasToken = email.length > 0 && sig.length > 0

  return (
    <div className="content-container py-12 small:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl small:text-3xl font-semibold mb-2">
          Email preferences
        </h1>
        <p className="text-ui-fg-subtle text-sm mb-6">
          Choose which SC PRINTS emails you&apos;d like to receive. You can
          change this any time.
        </p>

        {!hasToken ? (
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4 text-sm">
            <p className="font-medium">Link expired or invalid</p>
            <p className="text-ui-fg-muted mt-1">
              This page needs a signed token from an SC PRINTS email link.
              Try clicking the &quot;Manage preferences&quot; link from a
              recent email, or reply to any of our emails and we&apos;ll
              update your preferences manually.
            </p>
          </div>
        ) : (
          <EmailPreferencesForm
            email={email}
            kind={kind}
            sig={sig}
            justUnsubscribed={justUnsubscribed}
          />
        )}
      </div>
    </div>
  )
}
