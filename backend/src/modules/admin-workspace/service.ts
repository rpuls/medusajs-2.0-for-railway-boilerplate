import { MedusaService } from "@medusajs/framework/utils"

import CustomerTag from "./models/customer-tag"
import CustomerNote from "./models/customer-note"
import OrderComment from "./models/order-comment"
import AuditLog from "./models/audit-log"
import AdminBookmark from "./models/admin-bookmark"
import AdminPresence from "./models/admin-presence"

class AdminWorkspaceService extends MedusaService({
  CustomerTag,
  CustomerNote,
  OrderComment,
  AuditLog,
  AdminBookmark,
  AdminPresence,
}) {}

export default AdminWorkspaceService
