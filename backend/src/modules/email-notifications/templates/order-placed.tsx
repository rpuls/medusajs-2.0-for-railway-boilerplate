import { Text, Section, Hr, Row, Column } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
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
  const title = isMerchant ? 'New order received' : 'Order Confirmation'
  const greeting = isMerchant ? (
    <>
      <Text style={{ margin: '0 0 15px' }}>
        Customer: {shippingAddress.first_name} {shippingAddress.last_name}
      </Text>
      <Text style={{ margin: '0 0 15px' }}>
        Customer email: {order.email ?? '—'}
      </Text>
      <Text style={{ margin: '0 0 15px' }}>
        Internal order id: {order.id}
      </Text>
    </>
  ) : (
    <Text style={{ margin: '0 0 15px' }}>
      Dear {shippingAddress.first_name} {shippingAddress.last_name},
    </Text>
  )
  const intro = isMerchant ? (
    <Text style={{ margin: '0 0 30px' }}>Below is a copy of the order details.</Text>
  ) : (
    <Text style={{ margin: '0 0 30px' }}>
      Thank you for your recent order! Here are your order details:
    </Text>
  )

  const items = order.items ?? []

  return (
    <Base preview={effectivePreview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px' }}>
          {title}
        </Text>

        {greeting}

        {intro}

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
          Total: {formatPrice(order.summary.raw_current_order_total.value, order.currency_code)}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

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

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px' }}>
          Order Items
        </Text>

        <Section style={{ width: '100%', border: '1px solid #ddd', margin: '10px 0', borderCollapse: 'collapse' }}>
          <Row style={{ backgroundColor: '#f2f2f2', borderBottom: '1px solid #ddd' }}>
            <Column style={{ padding: '8px', fontWeight: 'bold' }}>Item</Column>
            <Column style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center', width: '60px' }}>Qty</Column>
            <Column style={{ padding: '8px', fontWeight: 'bold', textAlign: 'right', width: '90px' }}>Price</Column>
          </Row>
          {items.map((item) => (
            <Row key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
              <Column style={{ padding: '8px' }}>{item.product_title}</Column>
              <Column style={{ padding: '8px', textAlign: 'center', width: '60px' }}>{item.quantity}</Column>
              <Column style={{ padding: '8px', textAlign: 'right', width: '90px' }}>{formatPrice(item.unit_price, order.currency_code)}</Column>
            </Row>
          ))}
        </Section>
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
