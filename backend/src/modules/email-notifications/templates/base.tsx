import { Html, Body, Container, Preview, Tailwind, Head, Section, Text, Img } from '@react-email/components'
import * as React from 'react'

const NAVY = '#1a1a2e'
const MAGENTA = '#ff2e63'
const ACCENT = '#3dcfc2'
const SLATE = '#374151'
const MUTED = '#9ca3af'
const BORDER = '#ebebeb'
const BG_SUBTLE = '#f9fafb'

/** Shared style tokens — keep these in sync with the storefront design
 *  system (border-l-4 eyebrow + h2 + brand-secondary CTA). Importing
 *  from base.tsx is the canonical way to ensure templates don't drift.
 */
const STYLES = {
  eyebrow: {
    margin: 0,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.14em',
    color: MUTED,
  },
  h1: {
    margin: '8px 0 0',
    fontSize: '24px',
    fontWeight: 700,
    color: NAVY,
    lineHeight: '32px',
  },
  h2: {
    margin: '0 0 4px',
    fontSize: '18px',
    fontWeight: 700,
    color: NAVY,
    lineHeight: '26px',
  },
  greeting: {
    margin: '0 0 4px',
    fontSize: '18px',
    fontWeight: 700,
    color: NAVY,
  },
  body: {
    margin: '12px 0 0',
    fontSize: '15px',
    color: SLATE,
    lineHeight: '23px',
  },
  meta: {
    margin: 0,
    fontSize: '12px',
    color: MUTED,
    lineHeight: '18px',
  },
  buttonPrimary: {
    background: MAGENTA,
    color: '#ffffff',
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: 700,
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block' as const,
  },
  buttonSecondary: {
    background: '#ffffff',
    color: NAVY,
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '8px',
    border: `1px solid ${BORDER}`,
    textDecoration: 'none',
    display: 'inline-block' as const,
  },
  link: {
    color: MAGENTA,
    textDecoration: 'underline' as const,
  },
  divider: {
    margin: '24px 0',
    borderColor: BORDER,
    borderTopWidth: '1px',
    borderStyle: 'solid' as const,
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
  },
  staffNote: {
    margin: '20px 0 0',
    fontSize: '14px',
    color: SLATE,
    fontStyle: 'italic' as const,
    background: BG_SUBTLE,
    padding: '12px 16px',
    borderRadius: '8px',
    borderLeft: `3px solid ${MAGENTA}`,
  },
}

interface BaseProps {
  preview?: string
  children: React.ReactNode
  /**
   * Marketing emails (cart-reminder, reorder-reminder, winback, NPS) pass
   * a pre-signed one-click unsubscribe URL here. Renders an additional
   * footer line with the link when present. Transactional emails (order
   * placed, order shipped, etc.) leave this undefined and the footer
   * renders as before.
   */
  unsubscribeUrl?: string
}

export const Base: React.FC<BaseProps> = ({ preview, children, unsubscribeUrl }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: '#f5f5f7', margin: 0, padding: '40px 8px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
          <Container style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(26,26,46,0.10)' }}>
            {/* Branded header bar */}
            <Section style={{ backgroundColor: NAVY, padding: '20px 28px', textAlign: 'center' }}>
              <Img
                src="https://sc-prints.com.au/branding/sc-prints-logo-white.png"
                alt="SC Prints"
                width={160}
                style={{ margin: '0 auto', display: 'block' }}
              />
            </Section>

            {/* Email body */}
            <Section style={{ padding: '28px 28px 8px' }}>
              <div style={{ maxWidth: '100%', wordBreak: 'break-word' }}>
                {children}
              </div>
            </Section>

            {/* Footer */}
            <Section style={{ padding: '16px 28px 24px', borderTop: '1px solid #ebebeb' }}>
              <Text style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textAlign: 'center', lineHeight: '16px' }}>
                SC Prints &middot; Reply to this email for help &middot;{' '}
                <a href="https://sc-prints.com.au" style={{ color: '#9ca3af' }}>sc-prints.com.au</a>
              </Text>
              {unsubscribeUrl ? (
                <Text style={{ margin: '8px 0 0', fontSize: '11px', color: '#9ca3af', textAlign: 'center', lineHeight: '16px' }}>
                  You&apos;re receiving this because you&apos;re a SC Prints customer.{' '}
                  <a href={unsubscribeUrl} style={{ color: '#9ca3af', textDecoration: 'underline' }}>
                    Unsubscribe
                  </a>{' '}
                  or update your preferences.
                </Text>
              ) : null}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export { NAVY, MAGENTA, ACCENT, SLATE, MUTED, BORDER, BG_SUBTLE, STYLES }
