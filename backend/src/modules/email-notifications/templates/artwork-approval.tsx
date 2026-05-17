import { Button, Hr, Img, Section, Text } from "@react-email/components"

import { Base, MAGENTA } from "./base"

export const ARTWORK_APPROVAL = "artwork-approval"

export interface ArtworkApprovalEmailProps {
  approval: {
    firstName: string | null
    orderDisplayId: number | string | null
    /** Signed URL to the /artwork-approval page. If null, button is omitted. */
    approvalUrl: string | null
    /** Optional array of mockup images (one per decorated side). */
    mockupImages?: { url: string; side: string; sideLabel?: string | null }[] | null
    /** Legacy single-image fallback — used when mockupImages is absent. */
    proofImageUrl?: string | null
    /** Free-text note from the staff member who set up the proof. */
    staffNote?: string | null
  }
  preview?: string
}

export const isArtworkApprovalData = (data: any): data is ArtworkApprovalEmailProps =>
  typeof data?.approval === "object"

export const ArtworkApprovalEmail = ({
  approval,
  preview,
}: ArtworkApprovalEmailProps) => {
  const greeting = approval.firstName ? `Hi ${approval.firstName},` : "Hi,"
  const previewText = preview ?? "Your artwork proof is ready to approve."
  const orderRef = approval.orderDisplayId ? ` #${approval.orderDisplayId}` : ""

  const images =
    approval.mockupImages && approval.mockupImages.length > 0
      ? approval.mockupImages
      : approval.proofImageUrl
        ? [{ url: approval.proofImageUrl, side: "proof", sideLabel: null }]
        : null

  return (
    <Base preview={previewText}>
      <Text style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>
        {greeting}
      </Text>
      <Text style={{ margin: "12px 0 0", fontSize: "22px", fontWeight: 700, color: "#1a1a2e", lineHeight: "28px" }}>
        Your artwork proof is ready to review
      </Text>
      <Text style={{ margin: "12px 0 0", fontSize: "15px", color: "#374151", lineHeight: "23px" }}>
        We&apos;ve prepared the proof for order{orderRef} and need your sign-off
        before it goes to print. Click the button below to view it and approve —
        or reply to this email with any changes.
      </Text>

      {images ? (
        <Section style={{ margin: "24px 0 0" }}>
          {images.map((img) => (
            <Section key={img.side} style={{ margin: "0 0 16px" }}>
              {img.sideLabel ? (
                <Text style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af" }}>
                  {img.sideLabel}
                </Text>
              ) : null}
              <Img
                src={img.url}
                alt={img.sideLabel ?? img.side}
                style={{ maxWidth: "100%", borderRadius: "8px", display: "block" }}
              />
            </Section>
          ))}
        </Section>
      ) : null}

      {approval.staffNote ? (
        <Text style={{ margin: "20px 0 0", fontSize: "14px", color: "#374151", fontStyle: "italic", background: "#f9fafb", padding: "12px 16px", borderRadius: "8px", borderLeft: `3px solid ${MAGENTA}` }}>
          {approval.staffNote}
        </Text>
      ) : null}

      {approval.approvalUrl ? (
        <Section style={{ margin: "28px 0 8px", textAlign: "center" }}>
          <Button
            href={approval.approvalUrl}
            style={{
              background: MAGENTA,
              color: "#ffffff",
              padding: "14px 32px",
              fontSize: "15px",
              fontWeight: 700,
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Review &amp; approve artwork →
          </Button>
        </Section>
      ) : null}

      <Hr style={{ margin: "24px 0 16px", borderColor: "#ebebeb" }} />

      <Text style={{ margin: 0, fontSize: "12px", color: "#9ca3af", lineHeight: "18px" }}>
        This link is unique to your order. If colours, placement, or sizing
        need adjusting, reply to this email and we&apos;ll fix it before you confirm.
      </Text>
    </Base>
  )
}

ArtworkApprovalEmail.PreviewProps = {
  approval: {
    firstName: "Sam",
    orderDisplayId: 42,
    approvalUrl: "https://sc-prints.com.au/au/artwork-approval/test-id?sig=abc123",
    mockupImages: null,
    proofImageUrl: null,
    staffNote: null,
  },
} satisfies ArtworkApprovalEmailProps

export default ArtworkApprovalEmail
