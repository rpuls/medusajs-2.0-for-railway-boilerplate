import { Button, Link, Section, Text, Hr } from '@react-email/components'
import { Base } from './base'

/**
 * The key for the ResetPasswordEmail template, used to identify it
 */
export const RESET_PASSWORD = 'reset-password'

/**
 * The props for the ResetPasswordEmail template
 */
export interface ResetPasswordEmailProps {
  /**
   * The link that sets a new password. Carries the single-use reset token.
   */
  resetLink: string
  /**
   * The email the reset was requested for, shown so the recipient can tell
   * which account this is about.
   */
  email?: string
  /**
   * Whether this is an admin dashboard reset rather than a shopper account
   * reset. Only changes the wording.
   */
  isAdmin?: boolean
  /**
   * How long the link stays valid, in minutes. Medusa issues these tokens with
   * a 15 minute TTL, and saying so avoids a support email when it expires.
   */
  expiresInMinutes?: number
  /**
   * The preview text for the email, appears next to the subject
   * in mail providers like Gmail
   */
  preview?: string
  /**
   * The name of the store. Defaults to the STORE_NAME environment variable,
   * or "your store" when unset.
   */
  storeName?: string
}

/**
 * Type guard for checking if the data is of type ResetPasswordEmailProps
 * @param data - The data to check
 */
export const isResetPasswordData = (data: any): data is ResetPasswordEmailProps =>
  typeof data?.resetLink === 'string' && data.resetLink.length > 0

/**
 * The ResetPasswordEmail template component built with react-email
 */
export const ResetPasswordEmail = ({
  resetLink,
  email,
  isAdmin = false,
  expiresInMinutes = 15,
  storeName = process.env.STORE_NAME || 'your store',
  preview = 'Reset your password',
}: ResetPasswordEmailProps) => {
  const account = isAdmin
    ? `your administrator account on ${storeName}`
    : `your ${storeName} account`

  return (
    <Base preview={preview}>
      {/* Add your own store logo here, e.g. <Img src="https://yourstore.com/logo.png" alt="Your store" className="mx-auto w-28" /> */}
      <Section className="text-center mt-[32px]">
        <Text className="text-black text-[14px] leading-[24px]">
          Someone asked to reset the password for {account}
          {email ? <> (<strong>{email}</strong>)</> : null}.
        </Text>
        <Section className="mt-4 mb-[32px]">
          <Button
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline px-5 py-3"
            href={resetLink}
          >
            Set a new password
          </Button>
        </Section>
        <Text className="text-black text-[14px] leading-[24px]">
          or copy and paste this URL into your browser:
        </Text>
        <Text style={{
          maxWidth: '100%',
          wordBreak: 'break-all',
          overflowWrap: 'break-word'
        }}>
          <Link
            href={resetLink}
            className="text-blue-600 no-underline"
          >
            {resetLink}
          </Link>
        </Text>
      </Section>
      <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
      <Text className="text-[#666666] text-[12px] leading-[24px]">
        This link can be used once and expires in {expiresInMinutes} minutes. If
        you did not ask to reset your password, you can ignore this email and
        nothing will change.
      </Text>
    </Base>
  )
}

ResetPasswordEmail.PreviewProps = {
  resetLink: 'https://mystore.com/reset-password?token=abc123ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  email: 'shopper@example.com'
} as ResetPasswordEmailProps

export default ResetPasswordEmail
