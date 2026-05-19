import { Hr, Section, Text, Button } from "@react-email/components"

import { Base, STYLES, NAVY } from "./base"

export const CART_REMINDER = "cart-reminder"

type CartReminderItem = {
  title?: string | null
  quantity?: number | null
}

export interface CartReminderEmailProps {
  reminder: {
    cartId: string
    email: string
    itemCount: number
    currencyCode?: string | null
    cartTotal?: number | null
    countryCode?: string | null
    items?: CartReminderItem[]
    /** Optional resume link back into the storefront so the customer can keep
     *  going where they left off. */
    resumeUrl?: string | null
  }
  preview?: string
  /** Pre-signed one-click unsubscribe URL (built by the sender). */
  unsubscribeUrl?: string
}

export const isCartReminderData = (data: any): data is CartReminderEmailProps =>
  typeof data?.reminder === "object" &&
  typeof data?.reminder?.cartId === "string" &&
  typeof data?.reminder?.email === "string"

const formatTotal = (
  totalMinor: number | null | undefined,
  currencyCode: string | null | undefined
): string | null => {
  if (typeof totalMinor !== "number" || !currencyCode) return null
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(totalMinor / 100)
  } catch {
    return null
  }
}

export const CartReminderEmail = ({
  reminder,
  preview = "Your cart is saved and ready when you are.",
  unsubscribeUrl,
}: CartReminderEmailProps) => {
  const total = formatTotal(reminder.cartTotal, reminder.currencyCode)
  const itemList = (reminder.items ?? []).filter(
    (i) => (i.title?.trim()?.length ?? 0) > 0
  )

  return (
    <Base preview={preview} unsubscribeUrl={unsubscribeUrl}>
      <Text style={STYLES.eyebrow}>Saved for you</Text>
      <Text style={STYLES.h1}>Your cart is ready when you are</Text>
      <Text style={STYLES.body}>
        Looks like you didn&apos;t make it through checkout. We&apos;ve held
        your cart &mdash; pick up where you left off whenever it suits.
      </Text>

      {itemList.length > 0 ? (
        <Section style={{ margin: "24px 0 0" }}>
          <Text style={{ ...STYLES.eyebrow, margin: "0 0 8px" }}>
            In your cart
          </Text>
          {itemList.slice(0, 8).map((item, index) => (
            <Text
              key={`${item.title ?? "item"}-${index}`}
              style={{
                margin: "0 0 4px",
                fontSize: "15px",
                color: NAVY,
              }}
            >
              &middot; {item.title}
              {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ""}
            </Text>
          ))}
          {total ? (
            <Text
              style={{
                margin: "10px 0 0",
                fontSize: "15px",
                fontWeight: 700,
                color: NAVY,
              }}
            >
              Estimated total: {total}
            </Text>
          ) : null}
        </Section>
      ) : null}

      {reminder.resumeUrl ? (
        <Section style={{ margin: "24px 0 0" }}>
          <Button href={reminder.resumeUrl} style={STYLES.buttonPrimary}>
            Resume your cart &rarr;
          </Button>
        </Section>
      ) : null}

      <Hr style={STYLES.divider} />

      <Text style={STYLES.meta}>
        Need help with sizing, artwork, or a quote? Reply to this email and the
        team will get you sorted.
      </Text>
    </Base>
  )
}

export default CartReminderEmail
