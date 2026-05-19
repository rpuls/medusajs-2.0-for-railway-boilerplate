import { Hr, Section, Text } from "@react-email/components"
import { Base, STYLES, NAVY, BG_SUBTLE } from "./base"

export const CONTACT_SUBMISSION = "contact-submission"

export interface ContactSubmissionEmailData {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
  subject?: string | null
  message: string
  sourceOrigin?: string | null
  sourceIp?: string | null
  userAgent?: string | null
}

export interface ContactSubmissionEmailProps {
  submission: ContactSubmissionEmailData
  preview?: string
}

export const isContactSubmissionData = (data: any): data is ContactSubmissionEmailProps =>
  typeof data?.submission === "object" &&
  typeof data?.submission?.id === "string" &&
  typeof data?.submission?.email === "string" &&
  typeof data?.submission?.message === "string"

export const ContactSubmissionEmail = ({
  submission,
  preview = "A new contact form submission was received.",
}: ContactSubmissionEmailProps) => {
  const senderName = [submission.firstName, submission.lastName].filter(Boolean).join(" ").trim()

  return (
    <Base preview={preview}>
      <Text style={STYLES.eyebrow}>Contact form &middot; {submission.id}</Text>
      <Text style={STYLES.h1}>New contact submission</Text>

      <Section style={{ margin: "20px 0 0" }}>
        <Text style={{ ...STYLES.body, margin: 0 }}>
          <strong style={{ color: NAVY }}>Name:</strong>{" "}
          {senderName || "Not provided"}
        </Text>
        <Text style={{ ...STYLES.body, margin: "4px 0 0" }}>
          <strong style={{ color: NAVY }}>Email:</strong> {submission.email}
        </Text>
        <Text style={{ ...STYLES.body, margin: "4px 0 0" }}>
          <strong style={{ color: NAVY }}>Subject:</strong>{" "}
          {submission.subject || "Not provided"}
        </Text>
      </Section>

      <Hr style={STYLES.divider} />

      <Text style={STYLES.h2}>Message</Text>
      <Section
        style={{
          margin: "12px 0 0",
          padding: "14px 16px",
          background: BG_SUBTLE,
          borderRadius: "8px",
        }}
      >
        <Text
          style={{
            whiteSpace: "pre-wrap",
            margin: 0,
            fontSize: "15px",
            color: NAVY,
            lineHeight: "23px",
          }}
        >
          {submission.message}
        </Text>
      </Section>

      <Hr style={STYLES.divider} />

      <Text style={{ ...STYLES.meta, margin: "0 0 4px" }}>
        <strong style={{ color: NAVY }}>Origin:</strong>{" "}
        {submission.sourceOrigin || "Unknown"}
      </Text>
      <Text style={{ ...STYLES.meta, margin: "0 0 4px" }}>
        <strong style={{ color: NAVY }}>IP:</strong>{" "}
        {submission.sourceIp || "Unknown"}
      </Text>
      <Text style={STYLES.meta}>
        <strong style={{ color: NAVY }}>User agent:</strong>{" "}
        {submission.userAgent || "Unknown"}
      </Text>
    </Base>
  )
}

ContactSubmissionEmail.PreviewProps = {
  submission: {
    id: "01HTESTSUBMISSIONID",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    subject: "Order question",
    message: "Hi team,\nI need help with my latest order.",
    sourceOrigin: "https://medusajs-2-0-for-railway-vercel.vercel.app",
    sourceIp: "203.0.113.10",
    userAgent: "Mozilla/5.0",
  },
  preview: "A new contact form submission was received.",
} as ContactSubmissionEmailProps

export default ContactSubmissionEmail
