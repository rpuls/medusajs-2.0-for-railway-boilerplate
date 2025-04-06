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
} from '@react-email/components';

interface AssetUpdateEmailProps {
  customerName: string;
  assetTitle: string;
  version: string;
  changelog: string;
  downloadUrl: string;
}

export default function AssetUpdateEmail({
  customerName,
  assetTitle,
  version,
  changelog,
  downloadUrl,
}: AssetUpdateEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Update available for {assetTitle}</Preview>
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
            <Heading style={heading}>Asset Update Available</Heading>
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            <Text style={paragraph}>
              Good news! An update is available for <strong>{assetTitle}</strong> that you previously purchased.
              The asset has been updated to version <strong>{version}</strong>.
            </Text>

            <Section style={updateSection}>
              <Heading as="h2" style={subheading}>
                What's New in Version {version}
              </Heading>
              <Hr style={divider} />
              <Text style={changelogText}>
                {changelog || "This update includes bug fixes and improvements."}
              </Text>
            </Section>

            <Section style={ctaContainer}>
              <Button style={ctaButton} href={downloadUrl}>
                Download Updated Asset
              </Button>
            </Section>

            <Text style={paragraph}>
              You can also access this update and all your purchased assets in your account under "My Purchases".
            </Text>

            <Section style={secondaryCta}>
              <Button style={secondaryButton} href={`${process.env.NEXT_PUBLIC_URL}/account/purchases`}>
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

const updateSection = {
  backgroundColor: '#f0f4f9',
  padding: '15px',
  borderRadius: '5px',
  marginBottom: '20px',
};

const divider = {
  borderColor: '#e6ebf1',
  margin: '15px 0',
};

const changelogText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#4c4c4c',
  whiteSpace: 'pre-line' as const,
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

const secondaryCta = {
  marginTop: '10px',
  marginBottom: '30px',
  textAlign: 'center' as const,
};

const secondaryButton = {
  backgroundColor: '#ffffff',
  color: '#4f46e5',
  padding: '12px 30px',
  borderRadius: '5px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  border: '1px solid #4f46e5',
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
