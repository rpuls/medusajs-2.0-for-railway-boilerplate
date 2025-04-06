import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Column,
  Row,
} from '@react-email/components';

interface PurchaseConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  items: any[];
  downloadLinks: { title: string; url: string }[];
  total: number;
}

export default function PurchaseConfirmationEmail({
  customerName,
  orderNumber,
  items,
  downloadLinks,
  total,
}: PurchaseConfirmationEmailProps) {
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total / 100);

  return (
    <Html>
      <Head />
      <Preview>Your digital assets are ready to download</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${process.env.NEXT_PUBLIC_URL}/logo.png`}
              width="120"
              height="36"
              alt="Your Marketplace"
            />
          </Section>
          <Section style={content}>
            <Heading style={heading}>Thank you for your purchase!</Heading>
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            <Text style={paragraph}>
              Thank you for your purchase. Your digital assets are ready to download.
              Your order number is <strong>#{orderNumber}</strong>.
            </Text>

            <Section style={orderSummary}>
              <Heading as="h2" style={subheading}>
                Order Summary
              </Heading>
              <Hr style={divider} />
              
              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={itemDetails}>
                    <Text style={itemTitle}>{item.title}</Text>
                    <Text style={itemVariant}>
                      {item.variant?.title !== item.title ? item.variant?.title : ''}
                    </Text>
                  </Column>
                  <Column style={itemPrice}>
                    <Text>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(item.unit_price / 100)}
                    </Text>
                  </Column>
                </Row>
              ))}
              
              <Hr style={divider} />
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Total</Text>
                </Column>
                <Column style={itemPrice}>
                  <Text style={totalAmount}>{formattedTotal}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={downloadSection}>
              <Heading as="h2" style={subheading}>
                Your Downloads
              </Heading>
              <Text style={paragraph}>
                Click the links below to download your purchased assets:
              </Text>
              
              {downloadLinks.map((link, index) => (
                <Section key={index} style={downloadLinkContainer}>
                  <Text style={downloadLinkTitle}>{link.title}</Text>
                  <Button style={button} href={link.url}>
                    Download Asset
                  </Button>
                </Section>
              ))}
              
              <Text style={noteText}>
                These download links will also be available in your account under "My Purchases".
              </Text>
            </Section>

            <Section style={ctaContainer}>
              <Button style={ctaButton} href={`${process.env.NEXT_PUBLIC_URL}/account/purchases`}>
                View My Purchases
              </Button>
            </Section>

            <Hr style={divider} />
            
            <Text style={footerText}>
              If you have any questions or need assistance, please contact our support team at{' '}
              <Link href={`mailto:${process.env.SUPPORT_EMAIL || 'support@yourdomain.com'}`} style={link}>
                {process.env.SUPPORT_EMAIL || 'support@yourdomain.com'}
              </Link>.
            </Text>
            
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} Your Marketplace. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const logoContainer = {
  padding: '20px',
  borderBottom: '1px solid #e6ebf1',
};

const content = {
  padding: '20px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '20px',
};

const subheading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '10px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4c4c4c',
  marginBottom: '16px',
};

const orderSummary = {
  backgroundColor: '#f9f9f9',
  padding: '15px',
  borderRadius: '5px',
  marginBottom: '20px',
};

const divider = {
  borderColor: '#e6ebf1',
  margin: '15px 0',
};

const itemRow = {
  marginBottom: '8px',
};

const itemDetails = {
  width: '70%',
};

const itemTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  margin: '0',
};

const itemVariant = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
};

const itemPrice = {
  width: '30%',
  textAlign: 'right' as const,
};

const totalRow = {
  marginTop: '8px',
};

const totalLabel = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
};

const totalAmount = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
};

const downloadSection = {
  marginTop: '30px',
};

const downloadLinkContainer = {
  backgroundColor: '#f0f4f9',
  padding: '12px',
  borderRadius: '5px',
  marginBottom: '10px',
};

const downloadLinkTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '8px',
};

const button = {
  backgroundColor: '#4f46e5',
  color: '#fff',
  padding: '12px 20px',
  borderRadius: '5px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const noteText = {
  fontSize: '14px',
  color: '#666',
  fontStyle: 'italic',
  marginTop: '15px',
};

const ctaContainer = {
  marginTop: '30px',
  marginBottom: '30px',
  textAlign: 'center' as const,
};

const ctaButton = {
  backgroundColor: '#4f46e5',
  color: '#fff',
  padding: '12px 30px',
  borderRadius: '5px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const footerText = {
  fontSize: '14px',
  color: '#666',
  textAlign: 'center' as const,
  marginTop: '10px',
};

const link = {
  color: '#4f46e5',
  textDecoration: 'underline',
};
