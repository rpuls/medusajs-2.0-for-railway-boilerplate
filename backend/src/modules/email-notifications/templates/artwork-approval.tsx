import { Button, Hr, Img, Section, Text } from "@react-email/components"

import { Base } from "./base"

export const ARTWORK_APPROVAL = "artwork-approval"

export interface ArtworkApprovalEmailProps {
  approval: {
    firstName: string | null
    orderDisplayId: number | string | null
    approvalUrl: string
    /** Optional preview image URL — usually the latest production
     *  photo or a generated mockup. */
    proofImageUrl?: string | null
    /** Free-text note from the staff member who set up the proof. */
    staffNote?: string | null
  }
  preview?: string
}

export const isArtworkApprovalData = (data: any): data is ArtworkApprovalEmailProps =>
  typeof data?.approval === "object" &&
  typeof data?.approval?.approvalUrl === "string"

export const ArtworkApprovalEmail = ({
  approval,
  preview,
}: ArtworkApprovalEmailProps) => {
  const greeting = approval.firstName ? `Hi ${approval.firstName},` : "Hi,"
  const previewText = preview ?? "Your artwork proof is ready to approve."

  return (
    <Base preview={previewText}>
      <Section>
        <Text style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111111" }}>
          {greeting}
        </Text>
        <Text
          style={{
            margin: "12px 0 0 0",
            fontSize: "16px",
            fontWeight: 600,
            color: "#111111",
          }}
        >
          Your artwork proof is ready
        </Text>
        <Text
          style={{
            margin: "10px 0 0 0",
            fontSize: "15px",
            color: "#1f2937",
            lineHeight: "22px",
          }}
        >
          We&apos;ve prepared the proof for order
          {approval.orderDisplayId ? ` #${approval.orderDisplayId}` : ""} and we
          need a quick sign-off before it goes to the press. Click the button
          below to view the proof and approve — or reply with anything you want
          tweaked.
        </Text>

        {approval.proofImageUrl ? (
          <Section style={{ margin: "20px 0", textAlign: "center" }}>
            <Img
              src={approval.proofImageUrl}
              alt="Proof preview"
              style={{ maxWidth: "100%", borderRadius: 6, margin: "0 auto" }}
            />
          </Section>
        ) : null}

        {approval.staffNote ? (
          <Text
            style={{
              margin: "16px 0 0 0",
              fontSize: "14px",
              color: "#1f2937",
              fontStyle: "italic",
              background: "#f4f4f5",
              padding: "12px",
              borderRadius: 6,
            }}
          >
            {approval.staffNote}
          </Text>
        ) : null}

        <Section style={{ margin: "24px 0", textAlign: "center" }}>
          <Button
            href={approval.approvalUrl}
            style={{
              background: "#111111",
              color: "#ffffff",
              padding: "12px 22px",
              fontSize: "14px",
              fontWeight: 600,
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            View proof and approve →
          </Button>
        </Section>

        <Hr style={{ margin: "24px 0", borderColor: "#e5e5e5" }} />

        <Text
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#737373",
            lineHeight: "18px",
          }}
        >
          The approval link is unique to your order and signed so only you can
          use it. If something looks off — colours, placement, sizing — reply
          to this email and we&apos;ll fix it before you confirm.
        </Text>
      </Section>
    </Base>
  )
}

export default ArtworkApprovalEmail
