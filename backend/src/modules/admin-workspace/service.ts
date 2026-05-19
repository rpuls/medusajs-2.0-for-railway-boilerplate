import { MedusaService } from "@medusajs/framework/utils"

import CustomerTag from "./models/customer-tag"
import CustomerNote from "./models/customer-note"
import OrderComment from "./models/order-comment"
import AuditLog from "./models/audit-log"
import AdminBookmark from "./models/admin-bookmark"
import AdminPresence from "./models/admin-presence"
import StatusBanner from "./models/status-banner"
import CrmOwnerAssignment from "./models/crm-owner-assignment"
import CrmOwnerRotation from "./models/crm-owner-rotation"
import EmailSuppression from "./models/email-suppression"
import ResendEvent from "./models/resend-event"

class AdminWorkspaceService extends MedusaService({
  CustomerTag,
  CustomerNote,
  OrderComment,
  AuditLog,
  AdminBookmark,
  AdminPresence,
  StatusBanner,
  CrmOwnerAssignment,
  CrmOwnerRotation,
  EmailSuppression,
  ResendEvent,
}) {}

export default AdminWorkspaceService
