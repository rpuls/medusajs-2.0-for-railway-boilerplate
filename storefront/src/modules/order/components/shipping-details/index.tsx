import { convertMinorToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ColLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs uppercase tracking-wide text-ui-fg-subtle mb-2">
    {children}
  </span>
)

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[var(--brand-primary)] border-l-4 border-[var(--brand-secondary)] pl-4 mb-5">
        Delivery
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          className="flex flex-col"
          data-testid="shipping-address-summary"
        >
          <ColLabel>Shipping Address</ColLabel>
          <Text className="text-sm text-[var(--brand-primary)] font-medium">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="text-sm text-ui-fg-subtle">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text className="text-sm text-ui-fg-subtle">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text className="text-sm text-ui-fg-subtle">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-contact-summary"
        >
          <ColLabel>Contact</ColLabel>
          <Text className="text-sm text-ui-fg-subtle">
            {order.shipping_address?.phone}
          </Text>
          <Text className="text-sm text-ui-fg-subtle break-all">
            {order.email}
          </Text>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-method-summary"
        >
          <ColLabel>Method</ColLabel>
          <Text className="text-sm text-[var(--brand-primary)] font-medium">
            {(order as any).shipping_methods[0]?.name}
          </Text>
          <Text className="text-sm text-ui-fg-subtle">
            {convertMinorToLocale({
              amount: order.shipping_methods?.[0].total ?? 0,
              currency_code: order.currency_code,
            })}{" "}
            <span className="text-xs">ex GST</span>
          </Text>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
