import { Button, Link, Section, Text, Hr } from '@react-email/components'
import { Base } from './base'

/**
 * The key for the InviteUserEmail template, used to identify it
 */
export const INVITE_USER = 'invite-user'

/**
 * The props for the InviteUserEmail template
 */
export interface InviteUserEmailProps {
  /**
   * The link that the user can click to accept the invitation
   */
  inviteLink: string
  /**
   * The preview text for the email, appears next to the subject
   * in mail providers like Gmail
   */
  preview?: string
  /**
   * The name of the store the user is being invited to. Defaults to the
   * STORE_NAME environment variable, or "your store" when unset.
   */
  storeName?: string
}

/**
 * Type guard for checking if the data is of type InviteUserEmailProps
 * @param data - The data to check
 */
export const isInviteUserData = (data: any): data is InviteUserEmailProps =>
  typeof data.inviteLink === 'string' && (typeof data.preview === 'string' || !data.preview)

/**
 * The InviteUserEmail template component built with react-email
 */
export const InviteUserEmail = ({
  inviteLink,
  storeName = process.env.STORE_NAME || 'your store',
  preview = `You've been invited to join ${process.env.STORE_NAME || 'your store'} as an administrator`,
}: InviteUserEmailProps) => {
  return (
    <Base preview={preview}>
      {/* Add your own store logo here, e.g. <Img src="https://yourstore.com/logo.png" alt="Your store" className="mx-auto w-28" /> */}
      <Section className="text-center mt-[32px]">
        <Text className="text-black text-[14px] leading-[24px]">
          You&apos;ve been invited to be an administrator on <strong>{storeName}</strong>.
        </Text>
        <Section className="mt-4 mb-[32px]">
          <Button
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline px-5 py-3"
            href={inviteLink}
          >
            Accept Invitation
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
            href={inviteLink}
            className="text-blue-600 no-underline"
          >
            {inviteLink}
          </Link>
        </Text>
      </Section>
      <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
      <Text className="text-[#666666] text-[12px] leading-[24px]">
        If you were not expecting this invitation, you can ignore this email, as the
        invitation will expire in 24 hours. If you are concerned about your account's safety,
        please reply to this email to get in touch with us.
      </Text>
    </Base>
  )
}

InviteUserEmail.PreviewProps = {
  inviteLink: 'https://mywebsite.com/app/invite?token=abc123ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
} as InviteUserEmailProps

export default InviteUserEmail
