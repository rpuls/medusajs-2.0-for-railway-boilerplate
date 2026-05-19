import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { writeAudit } from "../audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../audit-entities"
import { ADMIN_WORKSPACE_MODULE } from "../../modules/admin-workspace"

const buildContainer = (overrides: { createAuditLogs?: jest.Mock } = {}) => {
  const createAuditLogs =
    overrides.createAuditLogs ?? jest.fn(async () => ({ id: "aud_1" }))
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
  return {
    resolve: jest.fn((key: string) => {
      if (key === ADMIN_WORKSPACE_MODULE) {
        return { createAuditLogs }
      }
      if (key === ContainerRegistrationKeys.LOGGER) {
        return logger
      }
      throw new Error(`unexpected resolve(${key})`)
    }),
    _spies: { createAuditLogs, logger },
  } as any
}

describe("writeAudit", () => {
  it("forwards a typed row to admin-workspace.createAuditLogs", async () => {
    const container = buildContainer()
    await writeAudit({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: "cust_123",
      action: AUDIT_ACTION.TAG_ADDED,
      actor_id: "user_42",
      actor_email: "ops@scprints.com.au",
      details: { tag: "VIP" },
    })
    expect(container._spies.createAuditLogs).toHaveBeenCalledWith({
      entity: "customer",
      entity_id: "cust_123",
      action: "tag_added",
      actor_id: "user_42",
      actor_email: "ops@scprints.com.au",
      details: { tag: "VIP" },
    })
  })

  it("supports nullable actor + details (null pass-through)", async () => {
    const container = buildContainer()
    await writeAudit({
      container,
      entity: AUDIT_ENTITY.ORDER,
      entity_id: "ord_1",
      action: AUDIT_ACTION.STAGE_CHANGED,
    })
    expect(container._spies.createAuditLogs).toHaveBeenCalledWith({
      entity: "order",
      entity_id: "ord_1",
      action: "stage_changed",
      actor_id: null,
      actor_email: null,
      details: null,
    })
  })

  it("does not write when entity_id is empty (warns + returns)", async () => {
    const container = buildContainer()
    await writeAudit({
      container,
      entity: AUDIT_ENTITY.ORDER,
      entity_id: "",
      action: AUDIT_ACTION.STAGE_CHANGED,
    })
    expect(container._spies.createAuditLogs).not.toHaveBeenCalled()
    expect(container._spies.logger.warn).toHaveBeenCalled()
  })

  it("swallows + logs when the underlying service throws (never crashes caller)", async () => {
    const container = buildContainer({
      createAuditLogs: jest.fn(async () => {
        throw new Error("db unavailable")
      }),
    })
    await expect(
      writeAudit({
        container,
        entity: AUDIT_ENTITY.QUOTE,
        entity_id: "qt_1",
        action: AUDIT_ACTION.STATUS_CHANGED,
      })
    ).resolves.toBeUndefined()
    expect(container._spies.logger.warn).toHaveBeenCalled()
  })

  it("preserves polymorphic entity values (organisation, task, etc.)", async () => {
    const container = buildContainer()
    await writeAudit({
      container,
      entity: AUDIT_ENTITY.ORGANISATION,
      entity_id: "org_1",
      action: AUDIT_ACTION.MEMBER_ADDED,
      details: { customer_id: "cust_7", role: "purchaser" },
    })
    const call = container._spies.createAuditLogs.mock.calls[0][0]
    expect(call.entity).toBe("organisation")
    expect(call.action).toBe("member_added")
    expect(call.details).toEqual({ customer_id: "cust_7", role: "purchaser" })
  })
})
