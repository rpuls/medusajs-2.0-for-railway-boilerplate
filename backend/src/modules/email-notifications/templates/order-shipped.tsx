import { Text, Section, Hr, Button } from '@react-email/components'
import * as React from 'react'
import { Base, STYLES, NAVY, SLATE, BORDER } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_SHIPPED = 'order-shipped'

export interface OrderShippedParcel {
  tracking_number: string
  tracking_url: string
  carrier_id?: string | null
  carrier_code?: string | null
  service_code?: string | null
  weight_grams?: number | null
  shipped_at?: string | null
}

interface OrderShippedPreviewProps {
  order: OrderDTO & { display_id: string }
  shippingAddress: OrderAddressDTO
  parcels: OrderShippedParcel[]
}

export interface OrderShippedTemplateProps {
  order: OrderDTO & { display_id: string }
  shippingAddress: OrderAddressDTO
  parcels: OrderShippedParcel[]
  preview?: string
}

export const isOrderShippedTemplateData = (
  data: any
): data is OrderShippedTemplateProps =>
  typeof data?.order === 'object' &&
  typeof data?.shippingAddress === 'object' &&
  Array.isArray(data?.parcels)

const formatCarrier = (parcel: OrderShippedParcel): string => {
  if (parcel.carrier_code) {
    return parcel.carrier_code
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }
  if (parcel.carrier_id) {
    return parcel.carrier_id
  }
  return 'Carrier'
}

export const OrderShippedTemplate: React.FC<OrderShippedTemplateProps> & {
  PreviewProps: OrderShippedPreviewProps
} = ({
  order,
  shippingAddress,
  parcels,
  preview = 'Your order is on its way!',
}) => {
  const parcelCount = parcels.length
  return (
    <Base preview={preview}>
      <Text style={STYLES.eyebrow}>Order #{order.display_id} &middot; Shipped</Text>
      <Text style={STYLES.h1}>Your order has shipped</Text>
      <Text style={STYLES.body}>
        Hi {shippingAddress.first_name} {shippingAddress.last_name}, order{' '}
        <strong style={{ color: NAVY }}>{order.display_id}</strong> is on its
        way. {parcelCount === 1
          ? "Track it below."
          : `We split it into ${parcelCount} parcels — track each below.`}
      </Text>

      <Hr style={STYLES.divider} />

      <Text style={STYLES.h2}>Tracking</Text>

      {parcels.map((parcel, idx) => (
        <Section
          key={parcel.tracking_number || `parcel-${idx}`}
          style={{
            padding: '12px 0',
            borderBottom:
              idx === parcels.length - 1 ? 'none' : `1px solid ${BORDER}`,
          }}
        >
          <Text style={{ margin: '0 0 6px', fontWeight: 700, color: NAVY }}>
            Parcel {idx + 1} of {parcelCount} &middot; {formatCarrier(parcel)}
          </Text>
          <Text style={{ margin: '0 0 10px', color: SLATE, fontSize: '14px' }}>
            Tracking: {parcel.tracking_number || '—'}
          </Text>
          {parcel.tracking_url && (
            <Button href={parcel.tracking_url} style={STYLES.buttonPrimary}>
              Track parcel {idx + 1}
            </Button>
          )}
        </Section>
      ))}

      <Hr style={STYLES.divider} />

      <Text style={STYLES.h2}>Delivering to</Text>
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

      <Text style={{ ...STYLES.meta, margin: '24px 0 0' }}>
        Reply to this email if anything looks off and we&apos;ll sort it out
        for you.
      </Text>
    </Base>
  )
}

OrderShippedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'ORD-123',
    email: 'test@example.com',
    currency_code: 'AUD',
    created_at: new Date().toISOString(),
  } as any,
  shippingAddress: {
    first_name: 'Test',
    last_name: 'User',
    address_1: '123 Main St',
    city: 'Sydney',
    province: 'NSW',
    postal_code: '2000',
    country_code: 'AU',
  } as OrderAddressDTO,
  parcels: [
    {
      tracking_number: 'AP1234567890AU',
      tracking_url:
        'https://auspost.com.au/mypost/track/#/details/AP1234567890AU',
      carrier_code: 'auspost',
      service_code: 'parcel_post',
    },
    {
      tracking_number: 'AP0987654321AU',
      tracking_url:
        'https://auspost.com.au/mypost/track/#/details/AP0987654321AU',
      carrier_code: 'auspost',
      service_code: 'parcel_post',
    },
  ],
}

export default OrderShippedTemplate
