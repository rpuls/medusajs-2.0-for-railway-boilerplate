/**
 * Canonical vocabulary for the polymorphic `audit_log` table
 * (`backend/src/modules/admin-workspace/models/audit-log.ts`).
 *
 * The model stores `entity` and `action` as freeform `text`, but every
 * call site MUST go through `writeAudit()` (see `./audit-log.ts`) which
 * accepts these typed constants. Adding a new audit source = add to
 * the union here; subscribers/routes can't drift on naming.
 */

export const AUDIT_ENTITY = {
  CUSTOMER: "customer",
  ORDER: "order",
  QUOTE: "quote",
  ORGANISATION: "organisation",
  TASK: "task",
} as const
export type AuditEntity = (typeof AUDIT_ENTITY)[keyof typeof AUDIT_ENTITY]

export const AUDIT_ACTION = {
  // Lifecycle
  CREATED: "created",
  DELETED: "deleted",
  STATUS_CHANGED: "status_changed",
  STAGE_CHANGED: "stage_changed",
  CONVERTED: "converted",
  EXPIRED: "expired",
  // Assignment
  ASSIGNED: "assigned",
  UNASSIGNED: "unassigned",
  OWNER_CHANGED: "owner_changed",
  // Workflow
  WATCHER_ADDED: "watcher_added",
  WATCHER_REMOVED: "watcher_removed",
  RULE_FIRED: "rule_fired",
  // Customer-side
  TAG_ADDED: "tag_added",
  TAG_REMOVED: "tag_removed",
  NOTE_ADDED: "note_added",
  NOTE_PINNED: "note_pinned",
  NOTE_SNOOZED: "note_snoozed",
  NOTE_DELETED: "note_deleted",
  COMMENT_POSTED: "comment_posted",
  CONSENT_CHANGED: "consent_changed",
  // Organisation
  MEMBER_ADDED: "member_added",
  MEMBER_REMOVED: "member_removed",
  // Email side-channels (Phase 8/9 — defined now so the constant is stable)
  EMAIL_SENT: "email_sent",
  EMAIL_OPENED: "email_opened",
  EMAIL_CLICKED: "email_clicked",
  EMAIL_BOUNCED: "email_bounced",
  EMAIL_SUPPRESSED: "email_suppressed",
  PAYMENT_LINK_CLICKED: "payment_link_clicked",
} as const
export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION]
