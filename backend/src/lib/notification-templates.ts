/**
 * Placeholder template GUIDs for Medusa notification system.
 * These are dummy GUIDs that satisfy the database constraint.
 * Our custom notification services (Resend/SendGrid) ignore these and use the template
 * from data.template instead.
 */
export const PLACEHOLDER_TEMPLATE_ID = '00000000-0000-0000-0000-000000000000'

/**
 * Map of template keys to placeholder GUIDs.
 * These GUIDs are only used to satisfy database constraints.
 * The actual template rendering is handled by our custom providers.
 */
export const TEMPLATE_IDS = {
  'invite-user': PLACEHOLDER_TEMPLATE_ID,
  'order-placed': PLACEHOLDER_TEMPLATE_ID,
} as const

