import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Img,
} from '@react-email/components'
import * as React from 'react'

/**
 * The key for the InviteUserEmail template, used to identify it
 */
export const INVITE_USER_TEMPLATE_KEY = 'invite-user'

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
  preview = `You've been invited to Medusa!`,
}: InviteUserEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg"
                alt="Medusa"
                className="mx-auto w-28"
              />
            </Section>
            <Section className="text-center">
              <Text className="text-black text-[14px] leading-[24px]">
                You&apos;ve been invited to be an administrator on <strong>Medusa</strong>.
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
                <br />
                <Link
                  href={inviteLink}
                  className="text-blue-600 no-underline whitespace-pre-wrap break-words max-w-[465px]"
                >
                  <span>{inviteLink}</span>
                </Link>
              </Text>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you were not expecting this invitation, you can ignore this email, as the
              invitation will expire in 24 hours. If you are concerned about your account's safety,
              please reply to this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

InviteUserEmail.PreviewProps = {
  inviteLink: 'https://mywebsite.com/app/invite?token=abc123',
} as InviteUserEmailProps

export default InviteUserEmail
