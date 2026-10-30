import { LightBulb } from "@medusajs/icons"
import { Heading, Text } from "@medusajs/ui"

/**
 * Placeholder policy pages: /shipping, /returns, /terms and /privacy.
 *
 * Example content, not legal text, and the page says so, with the same dashed
 * outline and label as the example hero on the homepage. They exist because
 * things link to them before a store owner has written any: the footer, and
 * the UCP checkout, which hands every AI agent a link to each policy (see
 * src/lib/ucp/operations.ts). A dead link there is worse than a page that
 * plainly says it is waiting for its text.
 *
 * What they state as fact is only what this storefront itself does, such as
 * showing delivery prices at checkout. Everything a store decides for itself
 * is a bracketed note saying what belongs there. To write your own, replace
 * the sections in the page files under src/app/[countryCode]/(main)/ and drop
 * the `example` banner from <PolicyPage>.
 */

export const PolicyPage = ({
  title,
  example,
  children,
}: {
  title: string
  /** What the store owner replaces this page with, for the example banner. */
  example: string
  children: React.ReactNode
}) => (
  <div className="content-container py-12 small:py-16">
    <div
      className="mx-auto flex max-w-2xl flex-col gap-y-6"
      data-testid="policy-page"
    >
      <Heading level="h1" className="text-3xl leading-10 font-normal">
        {title}
      </Heading>
      <section
        aria-label="Example page"
        className="rounded-lg border-2 border-dashed border-ui-border-strong bg-ui-bg-subtle"
      >
        <div className="flex flex-wrap items-center gap-x-2 border-b-2 border-dashed border-ui-border-strong px-6 py-3">
          <LightBulb className="text-ui-fg-muted shrink-0" />
          <Text
            size="small"
            leading="compact"
            className="text-ui-fg-subtle uppercase tracking-wider"
            data-testid="policy-example-label"
          >
            Example page
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-muted">
            replace it with {example}
          </Text>
        </div>
        <div className="flex flex-col gap-y-6 px-6 py-6">{children}</div>
      </section>
    </div>
  </div>
)

export const PolicySection = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-2">
    <Heading level="h2" className="txt-large-plus">
      {title}
    </Heading>
    <Text className="text-ui-fg-subtle">{children}</Text>
  </div>
)

/** What the store owner writes here, shown as a bracketed note. */
export const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="italic text-ui-fg-muted">[{children}]</span>
)
