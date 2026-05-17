import { Html, Body, Container, Preview, Tailwind, Head, Section, Text } from '@react-email/components'
import * as React from 'react'

const NAVY = '#1a1a2e'
const MAGENTA = '#ff2e63'

interface BaseProps {
  preview?: string
  children: React.ReactNode
}

export const Base: React.FC<BaseProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: '#f5f5f7', margin: 0, padding: '40px 8px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
          <Container style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(26,26,46,0.10)' }}>
            {/* Branded header bar */}
            <Section style={{ backgroundColor: NAVY, padding: '20px 28px', textAlign: 'center' }}>
              <Text style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '0.12em', color: '#ffffff' }}>
                SC <Text style={{ display: 'inline', color: MAGENTA }}>PRINTS</Text>
              </Text>
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
                SC Prints · Reply to this email for help · <a href="https://sc-prints.com.au" style={{ color: '#9ca3af' }}>sc-prints.com.au</a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export { NAVY, MAGENTA }
