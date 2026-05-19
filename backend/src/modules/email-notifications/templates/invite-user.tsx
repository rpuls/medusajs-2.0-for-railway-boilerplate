import { Button, Link, Section, Text, Hr } from '@react-email/components'
import { Base, STYLES } from './base'

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
  preview = `You've been invited to SC Prints Admin`,
}: InviteUserEmailProps) => {
  return (
    <Base preview={preview}>
      <Text style={STYLES.eyebrow}>Admin invitation</Text>
      <Text style={STYLES.h1}>You&apos;ve been invited</Text>
      <Text style={STYLES.body}>
        You&apos;ve been invited to be an administrator on{' '}
        <strong>SC Prints</strong>. Click below to accept and set up your
        account.
      </Text>

      <Section style={{ margin: '24px 0 0', textAlign: 'center' }}>
        <Button href={inviteLink} style={STYLES.buttonPrimary}>
          Accept invitation &rarr;
        </Button>
      </Section>

      <Text style={{ ...STYLES.meta, margin: '20px 0 0' }}>
        Or copy and paste this URL into your browser:
      </Text>
      <Text
        style={{
          margin: '6px 0 0',
          maxWidth: '100%',
          wordBreak: 'break-all',
          overflowWrap: 'break-word',
        }}
      >
        <Link href={inviteLink} style={STYLES.link}>
          {inviteLink}
        </Link>
      </Text>

      <Hr style={STYLES.divider} />

      <Text style={STYLES.meta}>
        If you weren&apos;t expecting this invitation, you can ignore this
        email &mdash; the invitation will expire in 24 hours. If you have any
        concerns about your account&apos;s safety, reply to this email to get
        in touch with us.
      </Text>
    </Base>
  )
}

InviteUserEmail.PreviewProps = {
  inviteLink: 'https://mywebsite.com/app/invite?token=abc123ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
} as InviteUserEmailProps

export default InviteUserEmail
