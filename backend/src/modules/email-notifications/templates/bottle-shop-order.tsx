import { Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'

export const BOTTLE_SHOP_ORDER = 'bottle-shop-order'

export type BottleShopLineItem = {
  productTitle: string
  variantTitle?: string | null
  quantity: number
  spiritType?: string | null
  capacityMl?: number | null
  externalCode?: string | null
}

export type BottleShopShipTo = {
  company: string
  contactName: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string | null
  email?: string | null
}

export interface BottleShopOrderTemplateProps {
  orderDisplayId: string
  orderId: string
  shopName: string
  items: BottleShopLineItem[]
  shipTo: BottleShopShipTo
  deliveryNotes?: string | null
  requestedBy?: string | null
}

export const isBottleShopOrderData = (
  data: any
): data is BottleShopOrderTemplateProps =>
  typeof data?.orderDisplayId === 'string' &&
  Array.isArray(data?.items) &&
  typeof data?.shipTo === 'object'

const cellLabel: React.CSSProperties = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#888',
  margin: '0 0 4px',
}

export const BottleShopOrderTemplate: React.FC<BottleShopOrderTemplateProps> & {
  PreviewProps: BottleShopOrderTemplateProps
} = ({
  orderDisplayId,
  shopName,
  items,
  shipTo,
  deliveryNotes,
  requestedBy,
}) => {
  const preview = `Bottle order ${orderDisplayId} — ${items.length} item${
    items.length === 1 ? '' : 's'
  } to fulfil`

  return (
    <Base preview={preview}>
      <Section>
        <Text
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            margin: '0 0 6px',
          }}
        >
          New bottle order — {orderDisplayId}
        </Text>
        <Text style={{ margin: '0 0 20px', color: '#555' }}>
          Hi {shopName} team, please prepare the bottles below and ship them to
          the SC Prints workshop. We&apos;ll UV-print the labels on arrival.
        </Text>

        <Hr style={{ margin: '0 0 20px' }} />

        <Text style={cellLabel}>Items</Text>
        <Section style={{ margin: '0 0 18px' }}>
          {items.map((item, idx) => (
            <Section
              key={`${item.productTitle}-${idx}`}
              style={{
                margin: '0 0 10px',
                paddingBottom: '10px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Text style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 600 }}>
                {item.productTitle}
                {item.variantTitle ? ` · ${item.variantTitle}` : ''}
              </Text>
              <Text style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                Qty {item.quantity}
                {item.spiritType ? ` · ${item.spiritType}` : ''}
                {item.capacityMl ? ` · ${item.capacityMl}ml` : ''}
                {item.externalCode ? ` · SKU ${item.externalCode}` : ''}
              </Text>
            </Section>
          ))}
        </Section>

        <Text style={cellLabel}>Ship to (SC Prints workshop)</Text>
        <Section style={{ margin: '0 0 18px' }}>
          <Text style={{ margin: 0, fontSize: '14px' }}>{shipTo.company}</Text>
          <Text style={{ margin: 0, fontSize: '14px' }}>{shipTo.contactName}</Text>
          <Text style={{ margin: 0, fontSize: '14px' }}>{shipTo.addressLine1}</Text>
          {shipTo.addressLine2 ? (
            <Text style={{ margin: 0, fontSize: '14px' }}>{shipTo.addressLine2}</Text>
          ) : null}
          <Text style={{ margin: 0, fontSize: '14px' }}>
            {shipTo.city}, {shipTo.state} {shipTo.postalCode}
          </Text>
          <Text style={{ margin: 0, fontSize: '14px' }}>{shipTo.country}</Text>
          {shipTo.phone ? (
            <Text style={{ margin: '6px 0 0', fontSize: '13px', color: '#666' }}>
              Phone: {shipTo.phone}
            </Text>
          ) : null}
          {shipTo.email ? (
            <Text style={{ margin: 0, fontSize: '13px', color: '#666' }}>
              Email: {shipTo.email}
            </Text>
          ) : null}
        </Section>

        {deliveryNotes ? (
          <>
            <Text style={cellLabel}>Notes</Text>
            <Text style={{ margin: '0 0 18px', whiteSpace: 'pre-wrap' }}>
              {deliveryNotes}
            </Text>
          </>
        ) : null}

        {requestedBy ? (
          <Text style={{ margin: '20px 0 0', color: '#777', fontSize: '12px' }}>
            Requested by {requestedBy} · Reply-all if anything looks off.
          </Text>
        ) : null}
      </Section>
    </Base>
  )
}

BottleShopOrderTemplate.PreviewProps = {
  orderDisplayId: 'ORD-1234',
  orderId: 'order_01',
  shopName: 'Vincent Vodka Co',
  items: [
    {
      productTitle: 'CÎROC Red Berry 700ml',
      variantTitle: '700ml',
      quantity: 4,
      spiritType: 'vodka',
      capacityMl: 700,
      externalCode: 'CIROC-RB-700',
    },
  ],
  shipTo: {
    company: 'SC Prints',
    contactName: 'Sean Mudie',
    addressLine1: '12 Print Lane',
    addressLine2: 'Unit 3',
    city: 'Sydney',
    state: 'NSW',
    postalCode: '2000',
    country: 'AU',
    phone: '+61 2 1234 5678',
    email: 'info@scprints.com.au',
  },
  deliveryNotes: 'Please ship by Friday — customer event on the 12th.',
  requestedBy: 'info@scprints.com.au',
}

export default BottleShopOrderTemplate
