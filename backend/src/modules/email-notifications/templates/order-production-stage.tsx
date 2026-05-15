import { Text, Section, Hr, Button, Img } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO } from '@medusajs/framework/types'

import {
  PRODUCTION_STAGE_LABEL,
  type ProductionStage,
} from '../../../lib/production-stage'

export const ORDER_PRODUCTION_STAGE = 'order-production-stage'

export interface OrderProductionStageTemplateProps {
  order: OrderDTO & { display_id: string }
  stage: ProductionStage
  customerFirstName?: string | null
  /** Optional URL deep-linking to the customer's order portal page. */
  portalUrl?: string | null
  /** Optional production photo to surface in this email (typically
   *  the most recently uploaded). Adds visual proof that the job is
   *  actually in the building. */
  productionPhoto?: {
    url: string
    caption?: string | null
  } | null
  /** Optional internal note from the staff member who changed the stage. Not shown to customer. */
  preview?: string
}

export const isOrderProductionStageData = (
  data: any
): data is OrderProductionStageTemplateProps =>
  typeof data?.order === 'object' && typeof data?.stage === 'string'

type StageCopy = {
  subjectLine: string
  heading: string
  intro: (firstName: string) => React.ReactNode
  body: React.ReactNode
  cta?: { label: string }
}

const stageCopy: Partial<Record<ProductionStage, StageCopy>> = {
  awaiting_approval: {
    subjectLine: 'Action needed: please approve your artwork',
    heading: 'Your proof is ready to review',
    intro: (firstName) => (
      <Text style={{ margin: '0 0 15px' }}>
        Hi {firstName},
      </Text>
    ),
    body: (
      <>
        <Text style={{ margin: '0 0 15px' }}>
          We&apos;ve prepared the proof for your order and we&apos;d love your sign-off
          before it goes to print.
        </Text>
        <Text style={{ margin: '0 0 15px' }}>
          Please reply to this email with any tweaks, or let us know it&apos;s a yes —
          once approved we&apos;ll move straight to production.
        </Text>
      </>
    ),
    cta: { label: 'View order' },
  },
  in_production: {
    subjectLine: 'Good news — your order is on the press',
    heading: 'In production',
    intro: (firstName) => (
      <Text style={{ margin: '0 0 15px' }}>Hi {firstName},</Text>
    ),
    body: (
      <>
        <Text style={{ margin: '0 0 15px' }}>
          Your order is now in production. We&apos;ll let you know as soon as it ships.
        </Text>
        <Text style={{ margin: '0 0 15px' }}>
          You can check progress any time from your account dashboard.
        </Text>
      </>
    ),
    cta: { label: 'Track order' },
  },
}

export function subjectForStage(
  stage: ProductionStage,
  displayId: string | number
): string {
  const copy = stageCopy[stage]
  const base = copy?.subjectLine ?? `Update on order ${displayId}: ${PRODUCTION_STAGE_LABEL[stage]}`
  return `${base} (Order ${displayId})`
}

export const OrderProductionStageTemplate: React.FC<OrderProductionStageTemplateProps> & {
  PreviewProps: OrderProductionStageTemplateProps
} = ({ order, stage, customerFirstName, portalUrl, productionPhoto, preview }) => {
  const copy = stageCopy[stage]
  const firstName = customerFirstName?.trim() || 'there'
  const heading = copy?.heading ?? PRODUCTION_STAGE_LABEL[stage]
  const previewText =
    preview ??
    (copy?.subjectLine ?? `Update on order ${order.display_id}: ${PRODUCTION_STAGE_LABEL[stage]}`)

  return (
    <Base preview={previewText}>
      <Section>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '0 0 30px',
          }}
        >
          {heading}
        </Text>

        {copy ? copy.intro(firstName) : (
          <Text style={{ margin: '0 0 15px' }}>Hi {firstName},</Text>
        )}

        {copy ? (
          copy.body
        ) : (
          <Text style={{ margin: '0 0 15px' }}>
            Order <strong>{order.display_id}</strong> has moved to{' '}
            <strong>{PRODUCTION_STAGE_LABEL[stage]}</strong>.
          </Text>
        )}

        {productionPhoto?.url ? (
          <Section style={{ margin: '20px 0', textAlign: 'center' }}>
            <Img
              src={productionPhoto.url}
              alt={productionPhoto.caption ?? 'Production photo'}
              style={{
                maxWidth: '100%',
                borderRadius: '6px',
                margin: '0 auto',
              }}
            />
            {productionPhoto.caption ? (
              <Text
                style={{
                  margin: '8px 0 0',
                  fontSize: '13px',
                  color: '#555',
                  fontStyle: 'italic',
                }}
              >
                {productionPhoto.caption}
              </Text>
            ) : null}
          </Section>
        ) : null}

        <Text style={{ margin: '0 0 15px' }}>
          Order reference: <strong>{order.display_id}</strong>
        </Text>

        {portalUrl && copy?.cta ? (
          <>
            <Hr style={{ margin: '20px 0' }} />
            <Section style={{ textAlign: 'center' }}>
              <Button
                href={portalUrl}
                style={{
                  background: '#000',
                  color: '#fff',
                  padding: '12px 22px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  display: 'inline-block',
                }}
              >
                {copy.cta.label}
              </Button>
            </Section>
          </>
        ) : null}

        <Text style={{ margin: '24px 0 0', color: '#555' }}>
          Reply to this email if anything looks off — we&apos;ll sort it out for you.
        </Text>
      </Section>
    </Base>
  )
}

OrderProductionStageTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'ORD-123',
    email: 'test@example.com',
    currency_code: 'AUD',
    created_at: new Date().toISOString(),
  } as any,
  stage: 'awaiting_approval',
  customerFirstName: 'Sam',
  portalUrl: 'https://example.com/account/orders/test-order-id',
}

export default OrderProductionStageTemplate
