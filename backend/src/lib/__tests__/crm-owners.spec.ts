import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

import { ADMIN_WORKSPACE_MODULE } from "../../modules/admin-workspace"
import { pickNextOwner, setOwner, getOwner, clearOwner } from "../crm-owners"
import { AUDIT_ENTITY } from "../audit-entities"

type RotationRow = {
  id: string
  user_id: string
  enabled: boolean
  position: number
  last_picked_at: Date | string | null
}

type AssignmentRow = {
  id: string
  user_id: string
  assigned_at: Date | string
  assigned_by: string | null
  reason: string | null
}

const buildContainer = (state: {
  rotation?: RotationRow[]
  assignment?: AssignmentRow | null
  // Optional: an existing assignment linked to entity_id (only one for the test).
  linkedAssignmentByEntity?: Record<string, AssignmentRow>
} = {}) => {
  const rotation = [...(state.rotation ?? [])]
  const linkedAssignmentByEntity = { ...(state.linkedAssignmentByEntity ?? {}) }

  const listCrmOwnerRotations = jest.fn(
    async (filter: any) => {
      let rows = rotation
      if (filter?.enabled !== undefined)
        rows = rows.filter((r) => r.enabled === filter.enabled)
      if (filter?.user_id)
        rows = rows.filter((r) => r.user_id === filter.user_id)
      return rows
    }
  )
  const updateCrmOwnerRotations = jest.fn(async (id: string, patch: any) => {
    const r = rotation.find((r) => r.id === id)
    if (r) Object.assign(r, patch)
    return r
  })
  const createCrmOwnerRotations = jest.fn(async (input: any) => {
    const created: RotationRow = {
      id: `crmrot_${rotation.length + 1}`,
      ...input,
    }
    rotation.push(created)
    return created
  })
  const deleteCrmOwnerRotations = jest.fn(async (ids: string[]) => {
    for (const id of ids) {
      const idx = rotation.findIndex((r) => r.id === id)
      if (idx >= 0) rotation.splice(idx, 1)
    }
  })

  const createCrmOwnerAssignments = jest.fn(async (input: any) => {
    const id = `crmown_${Math.random().toString(36).slice(2, 8)}`
    return { id, ...input }
  })
  const updateCrmOwnerAssignments = jest.fn(async (id: string, patch: any) => ({
    id,
    ...patch,
  }))
  const deleteCrmOwnerAssignments = jest.fn(async () => undefined)

  const createAuditLogs = jest.fn(async () => ({ id: "aud_1" }))

  const ws = {
    listCrmOwnerRotations,
    updateCrmOwnerRotations,
    createCrmOwnerRotations,
    deleteCrmOwnerRotations,
    createCrmOwnerAssignments,
    updateCrmOwnerAssignments,
    deleteCrmOwnerAssignments,
    createAuditLogs,
  }

  const linkCreate = jest.fn(async () => undefined)
  const linkDismiss = jest.fn(async () => undefined)

  const queryGraph = jest.fn(async ({ filters }: any) => {
    const id = filters?.id
    if (!id) return { data: [] }
    const existing = linkedAssignmentByEntity[id]
    if (!existing) return { data: [{ id, crm_owner_assignment: null }] }
    return {
      data: [
        {
          id,
          crm_owner_assignment: {
            id: existing.id,
            user_id: existing.user_id,
            assigned_at: existing.assigned_at,
            assigned_by: existing.assigned_by,
            reason: existing.reason,
          },
        },
      ],
    }
  })

  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }

  return {
    resolve: jest.fn((key: string) => {
      if (key === ADMIN_WORKSPACE_MODULE) return ws
      if (key === ContainerRegistrationKeys.LOGGER) return logger
      if (key === ContainerRegistrationKeys.QUERY)
        return { graph: queryGraph }
      if (key === ContainerRegistrationKeys.LINK)
        return { create: linkCreate, dismiss: linkDismiss }
      throw new Error(`unexpected resolve(${key})`)
    }),
    _state: { rotation, linkedAssignmentByEntity },
    _spies: {
      listCrmOwnerRotations,
      updateCrmOwnerRotations,
      createCrmOwnerAssignments,
      updateCrmOwnerAssignments,
      deleteCrmOwnerAssignments,
      createAuditLogs,
      linkCreate,
      linkDismiss,
      queryGraph,
      logger,
    },
  } as any
}

describe("pickNextOwner", () => {
  it("returns null when no one is enabled in rotation", async () => {
    const container = buildContainer({ rotation: [] })
    expect(await pickNextOwner({ container })).toBeNull()
  })

  it("picks the never-picked user before any picked user", async () => {
    const past = new Date("2026-05-01T00:00:00Z")
    const container = buildContainer({
      rotation: [
        { id: "r1", user_id: "u1", enabled: true, position: 100, last_picked_at: past },
        { id: "r2", user_id: "u2", enabled: true, position: 100, last_picked_at: null },
      ],
    })
    const picked = await pickNextOwner({ container })
    expect(picked).toEqual({ user_id: "u2" })
  })

  it("picks the oldest last_picked_at when all have been picked", async () => {
    const container = buildContainer({
      rotation: [
        { id: "r1", user_id: "u1", enabled: true, position: 100, last_picked_at: new Date("2026-05-15T00:00:00Z") },
        { id: "r2", user_id: "u2", enabled: true, position: 100, last_picked_at: new Date("2026-05-01T00:00:00Z") },
        { id: "r3", user_id: "u3", enabled: true, position: 100, last_picked_at: new Date("2026-05-10T00:00:00Z") },
      ],
    })
    const picked = await pickNextOwner({ container })
    expect(picked).toEqual({ user_id: "u2" })
  })

  it("tiebreaks on position when last_picked_at is equal", async () => {
    const sameTs = new Date("2026-05-10T00:00:00Z")
    const container = buildContainer({
      rotation: [
        { id: "r1", user_id: "u1", enabled: true, position: 200, last_picked_at: sameTs },
        { id: "r2", user_id: "u2", enabled: true, position: 50, last_picked_at: sameTs },
      ],
    })
    const picked = await pickNextOwner({ container })
    expect(picked).toEqual({ user_id: "u2" })
  })

  it("updates last_picked_at on the chosen row", async () => {
    const container = buildContainer({
      rotation: [
        { id: "r1", user_id: "u1", enabled: true, position: 100, last_picked_at: null },
      ],
    })
    await pickNextOwner({ container })
    expect(container._spies.updateCrmOwnerRotations).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ last_picked_at: expect.any(Date) })
    )
  })

  it("ignores disabled rows", async () => {
    const container = buildContainer({
      rotation: [
        { id: "r1", user_id: "u1", enabled: false, position: 100, last_picked_at: null },
      ],
    })
    expect(await pickNextOwner({ container })).toBeNull()
  })
})

describe("setOwner", () => {
  it("creates an assignment + link when entity has no existing owner", async () => {
    const container = buildContainer({ linkedAssignmentByEntity: {} })
    await setOwner({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: "cust_1",
      user_id: "user_alice",
      actor: "user_actor",
    })
    expect(container._spies.createCrmOwnerAssignments).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user_alice",
        assigned_by: "user_actor",
      })
    )
    expect(container._spies.linkCreate).toHaveBeenCalled()
    expect(container._spies.createAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: "customer",
        action: "owner_changed",
        details: expect.objectContaining({
          to_user_id: "user_alice",
          from_user_id: null,
        }),
      })
    )
  })

  it("updates the existing assignment row (does NOT create a duplicate)", async () => {
    const container = buildContainer({
      linkedAssignmentByEntity: {
        cust_1: {
          id: "crmown_existing",
          user_id: "user_old",
          assigned_at: new Date("2026-04-01T00:00:00Z"),
          assigned_by: null,
          reason: null,
        },
      },
    })
    await setOwner({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: "cust_1",
      user_id: "user_new",
      actor: "user_actor",
    })
    expect(container._spies.updateCrmOwnerAssignments).toHaveBeenCalledWith(
      "crmown_existing",
      expect.objectContaining({ user_id: "user_new" })
    )
    expect(container._spies.createCrmOwnerAssignments).not.toHaveBeenCalled()
    expect(container._spies.linkCreate).not.toHaveBeenCalled()
    expect(container._spies.createAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          from_user_id: "user_old",
          to_user_id: "user_new",
        }),
      })
    )
  })

  it("supports orders as well as customers (correct linkable)", async () => {
    const container = buildContainer({ linkedAssignmentByEntity: {} })
    await setOwner({
      container,
      entity: AUDIT_ENTITY.ORDER,
      entity_id: "ord_1",
      user_id: "user_x",
    })
    const linkCall = container._spies.linkCreate.mock.calls[0][0]
    expect(linkCall[Modules.ORDER]).toEqual({ order_id: "ord_1" })
    expect(linkCall[ADMIN_WORKSPACE_MODULE]).toHaveProperty(
      "crm_owner_assignment_id"
    )
  })
})

describe("getOwner", () => {
  it("returns the owner row when assignment exists", async () => {
    const container = buildContainer({
      linkedAssignmentByEntity: {
        ord_1: {
          id: "crmown_1",
          user_id: "user_alice",
          assigned_at: new Date("2026-05-01T10:00:00Z"),
          assigned_by: "user_actor",
          reason: "manual",
        },
      },
    })
    const owner = await getOwner({
      container,
      entity: AUDIT_ENTITY.ORDER,
      entity_id: "ord_1",
    })
    expect(owner).toMatchObject({
      assignment_id: "crmown_1",
      user_id: "user_alice",
      assigned_by: "user_actor",
      reason: "manual",
    })
  })

  it("returns null when no assignment is linked", async () => {
    const container = buildContainer({ linkedAssignmentByEntity: {} })
    const owner = await getOwner({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: "cust_nobody",
    })
    expect(owner).toBeNull()
  })
})

describe("clearOwner", () => {
  it("dismisses the link, deletes the row, and writes an audit", async () => {
    const container = buildContainer({
      linkedAssignmentByEntity: {
        cust_1: {
          id: "crmown_x",
          user_id: "user_old",
          assigned_at: new Date(),
          assigned_by: null,
          reason: null,
        },
      },
    })
    await clearOwner({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: "cust_1",
      actor: "user_actor",
    })
    expect(container._spies.linkDismiss).toHaveBeenCalled()
    expect(container._spies.deleteCrmOwnerAssignments).toHaveBeenCalledWith([
      "crmown_x",
    ])
    expect(container._spies.createAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "unassigned",
        details: expect.objectContaining({ from_user_id: "user_old" }),
      })
    )
  })

  it("is idempotent — no-op when nothing to clear", async () => {
    const container = buildContainer({ linkedAssignmentByEntity: {} })
    await clearOwner({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: "cust_nobody",
    })
    expect(container._spies.linkDismiss).not.toHaveBeenCalled()
    expect(container._spies.deleteCrmOwnerAssignments).not.toHaveBeenCalled()
  })
})
