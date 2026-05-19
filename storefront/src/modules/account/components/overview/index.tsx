import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertMinorToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
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

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0
  const recentOrders = orders ?? []

  return (
    <div data-testid="overview-page-wrapper">
      <div className="hidden small:block">
        <header className="border-l-4 border-[var(--brand-secondary)] pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Account overview
          </p>
          <h1
            className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl"
            data-testid="welcome-message"
            data-value={customer?.first_name}
          >
            Hello {customer?.first_name}
          </h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Signed in as{" "}
            <span
              className="font-semibold text-ui-fg-base"
              data-testid="customer-email"
              data-value={customer?.email}
            >
              {customer?.email}
            </span>
          </p>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-ui-border-base bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Profile
            </p>
            <p
              className="mt-3 text-3xl font-semibold text-ui-fg-base small:text-4xl"
              data-testid="customer-profile-completion"
              data-value={profileCompletion}
            >
              {profileCompletion}
              <span className="text-2xl text-ui-fg-muted">%</span>
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-subtle">
              Completed
            </p>
            {profileCompletion < 100 ? (
              <LocalizedClientLink
                href="/account/profile"
                className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
              >
                Finish your profile
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </LocalizedClientLink>
            ) : null}
          </div>

          <div className="rounded-2xl border border-ui-border-base bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Addresses
            </p>
            <p
              className="mt-3 text-3xl font-semibold text-ui-fg-base small:text-4xl"
              data-testid="addresses-count"
              data-value={addressCount}
            >
              {addressCount}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-subtle">
              Saved
            </p>
            <LocalizedClientLink
              href="/account/addresses"
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
            >
              {addressCount > 0 ? "Manage addresses" : "Add an address"}
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </LocalizedClientLink>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
                Recent activity
              </p>
              <h2 className="mt-1 text-xl font-semibold text-ui-fg-base">
                Your latest orders
              </h2>
            </div>
            {recentOrders.length > 0 ? (
              <LocalizedClientLink
                href="/account/orders"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
              >
                View all orders
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </LocalizedClientLink>
            ) : null}
          </div>

          <ul
            className="flex list-none flex-col gap-3 p-0"
            data-testid="orders-wrapper"
          >
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <li
                  key={order.id}
                  data-testid="order-wrapper"
                  data-value={order.id}
                >
                  <LocalizedClientLink
                    href={`/account/orders/details/${order.id}`}
                    className="group block rounded-xl border border-ui-border-base bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--brand-secondary)]/40 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="grid flex-1 grid-cols-3 gap-x-4 gap-y-1 text-xs small:text-sm">
                        <span className="font-semibold uppercase tracking-[0.08em] text-ui-fg-subtle">
                          Date placed
                        </span>
                        <span className="font-semibold uppercase tracking-[0.08em] text-ui-fg-subtle">
                          Order
                        </span>
                        <span className="font-semibold uppercase tracking-[0.08em] text-ui-fg-subtle">
                          Total
                        </span>
                        <span
                          className="text-ui-fg-base"
                          data-testid="order-created-date"
                        >
                          {new Date(order.created_at).toDateString()}
                        </span>
                        <span
                          className="font-semibold text-ui-fg-base"
                          data-testid="order-id"
                          data-value={order.display_id}
                        >
                          #{order.display_id}
                        </span>
                        <span
                          className="font-semibold text-ui-fg-base"
                          data-testid="order-amount"
                        >
                          {convertMinorToLocale({
                            amount: order.total,
                            currency_code: order.currency_code,
                          })}
                        </span>
                      </div>
                      <button
                        className="flex items-center justify-between text-ui-fg-subtle transition group-hover:text-[var(--brand-secondary)]"
                        data-testid="open-order-button"
                        type="button"
                      >
                        <span className="sr-only">
                          Go to order #{order.display_id}
                        </span>
                        <ChevronDown className="-rotate-90" />
                      </button>
                    </div>
                  </LocalizedClientLink>
                </li>
              ))
            ) : (
              <li>
                <div className="rounded-xl border border-dashed border-ui-border-base bg-white p-6 text-center">
                  <p
                    className="text-sm text-ui-fg-subtle"
                    data-testid="no-orders-message"
                  >
                    No orders yet. When you place one, it&apos;ll appear here.
                  </p>
                  <LocalizedClientLink
                    href="/store"
                    className="group mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    Browse the store
                    <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                  </LocalizedClientLink>
                </div>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
