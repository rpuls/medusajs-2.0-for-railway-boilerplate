import { Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress?: OrderAddressDTO | null
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  /** Absent for digital orders, which have nothing to ship. */
  shippingAddress?: OrderAddressDTO | null
  preview?: string
}

// Only the order is required. Digital orders carry no shipping address, and
// requiring one here used to mean no confirmation email was sent at all.
export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data?.order === 'object' && data.order !== null

/**
 * Medusa v2 stores money as BigNumber-backed decimals, which arrive as strings.
 * Printing them raw gave totals like "45 eur" instead of "€45.00".
 */
const formatAmount = (amount: unknown, currencyCode?: string): string => {
  const value = Number(amount)
  const code = (currencyCode ?? '').toUpperCase()

  if (!Number.isFinite(value)) {
    return [amount, code].filter(Boolean).join(' ')
  }

  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(value)
  } catch {
    // Unknown or missing currency code: still better than a bare BigNumber.
    return [value.toFixed(2), code].filter(Boolean).join(' ')
  }
}

/**
 * Quantities come back as BigNumber objects, not numbers.
 *
 * React refuses to render an object child, so printing one raw threw
 * "Objects are not valid as a React child (found: 1)" from inside the Resend
 * SDK, which failed the whole email rather than just that cell. Amounts were
 * already coerced by formatAmount above; the quantity was the one value still
 * being handed to React untouched.
 */
const formatQuantity = (quantity: unknown): string => {
  const value = Number(quantity)
  return Number.isFinite(value) ? String(value) : ''
}

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, preview = 'Your order has been placed!' }) => {
  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px' }}>
          Order Confirmation
        </Text>

        <Text style={{ margin: '0 0 15px' }}>
          {shippingAddress?.first_name
            ? `Dear ${[shippingAddress.first_name, shippingAddress.last_name].filter(Boolean).join(' ')},`
            : 'Hello,'}
        </Text>

        <Text style={{ margin: '0 0 30px' }}>
          Thank you for your recent order! Here are your order details:
        </Text>

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Order Summary
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Order ID: {order.display_id}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Order Date: {new Date(order.created_at).toLocaleDateString()}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          {/* summary is only present when the order was fetched with it, and
              without this fallback the total rendered as a bare currency code. */}
          Total:{' '}
          {formatAmount(
            order.summary?.raw_current_order_total?.value ?? order.total,
            order.currency_code
          )}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        {shippingAddress && (
          <>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
              Shipping Address
            </Text>
            <Text style={{ margin: '0 0 5px' }}>
              {shippingAddress.address_1}
            </Text>
            <Text style={{ margin: '0 0 5px' }}>
              {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
            </Text>
            <Text style={{ margin: '0 0 20px' }}>
              {shippingAddress.country_code}
            </Text>

            <Hr style={{ margin: '20px 0' }} />
          </>
        )}

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px' }}>
          Order Items
        </Text>

        <div style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
          margin: '10px 0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#f2f2f2',
            padding: '8px',
            borderBottom: '1px solid #ddd'
          }}>
            <Text style={{ fontWeight: 'bold' }}>Item</Text>
            <Text style={{ fontWeight: 'bold' }}>Quantity</Text>
            <Text style={{ fontWeight: 'bold' }}>Price</Text>
          </div>
          {(order.items ?? []).map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
              borderBottom: '1px solid #ddd'
            }}>
              <Text>{item.title} - {item.product_title}</Text>
              <Text>{formatQuantity(item.quantity)}</Text>
              <Text>{formatAmount(item.unit_price, order.currency_code)}</Text>
            </div>
          ))}
        </div>
      </Section>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'ORD-123',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'USD',
    items: [
      { id: 'item-1', title: 'Item 1', product_title: 'Product 1', quantity: 2, unit_price: 10 },
      { id: 'item-2', title: 'Item 2', product_title: 'Product 2', quantity: 1, unit_price: 25 }
    ],
    shipping_address: {
      first_name: 'Test',
      last_name: 'User',
      address_1: '123 Main St',
      city: 'Anytown',
      province: 'CA',
      postal_code: '12345',
      country_code: 'US'
    },
    summary: { raw_current_order_total: { value: 45 } }
  },
  shippingAddress: {
    first_name: 'Test',
    last_name: 'User',
    address_1: '123 Main St',
    city: 'Anytown',
    province: 'CA',
    postal_code: '12345',
    country_code: 'US'
  }
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
