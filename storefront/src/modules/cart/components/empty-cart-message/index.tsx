import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

const CartIcon = ({ className }: { className?: string }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M3 4h2l2.4 12.2a2 2 0 002 1.6h8.2a2 2 0 002-1.5L21 8H6" />
    <circle cx="10" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
  </svg>
)

const EmptyCartMessage = () => {
  return (
    <div
      className="py-20 small:py-28"
      data-testid="empty-cart-message"
    >
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-ui-border-base bg-white text-[var(--brand-secondary)]">
          <CartIcon />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          Your cart
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">
          Nothing here yet
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ui-fg-subtle">
          You don&apos;t have anything in your cart. Browse the catalog or
          jump straight into the customizer to start a new design.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <LocalizedClientLink
            href="/store"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Browse the store
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/customizer"
            className="inline-flex items-center rounded-lg border border-ui-border-base bg-white px-6 py-3 text-sm font-semibold text-ui-fg-base transition hover:bg-ui-bg-subtle"
          >
            Start a design
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default EmptyCartMessage
