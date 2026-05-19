import { Text, Section, Hr, Row, Column } from '@react-email/components'
import * as React from 'react'
import { Base, STYLES, NAVY, SLATE, BORDER, BG_SUBTLE } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)
}

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  preview?: string
  /** When `merchant`, copy is aimed at the shop inbox instead of the customer. */
  audience?: 'customer' | 'merchant'
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({
  order,
  shippingAddress,
  preview,
  audience = 'customer',
}) => {
  const isMerchant = audience === 'merchant'
  const effectivePreview =
    preview ??
    (isMerchant
      ? `New order #${order.display_id}`
      : 'Your order has been placed!')
  const eyebrow = isMerchant ? 'New order' : 'Order confirmation'
  const title = isMerchant ? 'New order received' : 'Thanks for your order'

  const items = order.items ?? []

  return (
    <Base preview={effectivePreview}>
      <Text style={STYLES.eyebrow}>
        Order #{order.display_id} &middot; {eyebrow}
      </Text>
      <Text style={STYLES.h1}>{title}</Text>

      {isMerchant ? (
        <Section style={{ margin: '20px 0 0' }}>
          <Text style={{ ...STYLES.body, margin: 0 }}>
            <strong style={{ color: NAVY }}>Customer:</strong>{' '}
            {shippingAddress.first_name} {shippingAddress.last_name}
          </Text>
          <Text style={{ ...STYLES.body, margin: '4px 0 0' }}>
            <strong style={{ color: NAVY }}>Email:</strong>{' '}
            {order.email ?? '—'}
          </Text>
          <Text style={{ ...STYLES.body, margin: '4px 0 0' }}>
            <strong style={{ color: NAVY }}>Internal id:</strong> {order.id}
          </Text>
        </Section>
      ) : (
        <Text style={STYLES.body}>
          Hi {shippingAddress.first_name} {shippingAddress.last_name},
          we&apos;ve received your order and will email you again as soon as
          it moves into production. Here&apos;s a copy for your records.
        </Text>
      )}

      <Hr style={STYLES.divider} />

      <Text style={STYLES.h2}>Order summary</Text>
      <Section
        style={{
          margin: '12px 0 0',
          padding: '12px 16px',
          background: BG_SUBTLE,
          borderRadius: '8px',
        }}
      >
        <Text style={{ margin: 0, fontSize: '14px', color: SLATE }}>
          <strong style={{ color: NAVY }}>Order:</strong> #{order.display_id}
        </Text>
        <Text style={{ margin: '4px 0 0', fontSize: '14px', color: SLATE }}>
          <strong style={{ color: NAVY }}>Placed:</strong>{' '}
          {new Date(order.created_at).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        <Text
          style={{
            margin: '8px 0 0',
            fontSize: '16px',
            fontWeight: 700,
            color: NAVY,
          }}
        >
          Total{' '}
          {formatPrice(
            order.summary.raw_current_order_total.value,
            order.currency_code
          )}
        </Text>
      </Section>

      <Hr style={STYLES.divider} />

      <Text style={STYLES.h2}>Shipping to</Text>
      <Text style={{ ...STYLES.body, margin: '6px 0 0' }}>
        {shippingAddress.address_1}
      </Text>
      <Text style={{ ...STYLES.body, margin: '2px 0 0' }}>
        {shippingAddress.city}, {shippingAddress.province}{' '}
        {shippingAddress.postal_code}
      </Text>
      <Text style={{ ...STYLES.body, margin: '2px 0 0' }}>
        {shippingAddress.country_code}
      </Text>

      <Hr style={STYLES.divider} />

      <Text style={STYLES.h2}>Items</Text>
      <Section
        style={{
          width: '100%',
          margin: '12px 0 0',
          border: `1px solid ${BORDER}`,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Row
          style={{
            background: BG_SUBTLE,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <Column
            style={{
              padding: '10px 12px',
              fontWeight: 700,
              fontSize: '12px',
              color: NAVY,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Item
          </Column>
          <Column
            style={{
              padding: '10px 12px',
              fontWeight: 700,
              fontSize: '12px',
              color: NAVY,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textAlign: 'center',
              width: '60px',
            }}
          >
            Qty
          </Column>
          <Column
            style={{
              padding: '10px 12px',
              fontWeight: 700,
              fontSize: '12px',
              color: NAVY,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textAlign: 'right',
              width: '90px',
            }}
          >
            Price
          </Column>
        </Row>
        {items.map((item, idx) => (
          <Row
            key={item.id}
            style={{
              borderBottom:
                idx === items.length - 1 ? 'none' : `1px solid ${BORDER}`,
            }}
          >
            <Column
              style={{ padding: '10px 12px', fontSize: '14px', color: SLATE }}
            >
              {item.product_title}
            </Column>
            <Column
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                color: SLATE,
                textAlign: 'center',
                width: '60px',
              }}
            >
              {item.quantity}
            </Column>
            <Column
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                color: SLATE,
                textAlign: 'right',
                width: '90px',
                whiteSpace: 'nowrap',
              }}
            >
              {formatPrice(item.unit_price, order.currency_code)}
            </Column>
          </Row>
        ))}
      </Section>

      <Text style={{ ...STYLES.meta, margin: '24px 0 0' }}>
        Reply to this email if anything looks off and we&apos;ll sort it out.
      </Text>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'ORD-123',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'AUD',
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
