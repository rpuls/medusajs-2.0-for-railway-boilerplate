import {
  InventoryLinkProbe,
  isLiveLinkToLiveVariant,
  isOrphanInventoryItem,
} from "../orphan-inventory"

const link = (overrides: Partial<InventoryLinkProbe>): InventoryLinkProbe => ({
  link_deleted_at: null,
  variant_exists: true,
  variant_deleted_at: null,
  ...overrides,
})

describe("orphan-inventory", () => {
  describe("isOrphanInventoryItem", () => {
    it("treats no link rows as orphan (case a)", () => {
      expect(isOrphanInventoryItem([])).toBe(true)
    })

    it("treats link to live variant as non-orphan (case b)", () => {
      expect(isOrphanInventoryItem([link({})])).toBe(false)
    })

    it("treats link to soft-deleted variant as orphan (case c)", () => {
      expect(
        isOrphanInventoryItem([link({ variant_deleted_at: new Date() })])
      ).toBe(true)
    })

    it("treats link to missing variant as orphan (case d)", () => {
      expect(
        isOrphanInventoryItem([
          link({ variant_exists: false, variant_deleted_at: null }),
        ])
      ).toBe(true)
    })

    it("treats soft-deleted link row as orphan even if variant is live", () => {
      expect(
        isOrphanInventoryItem([link({ link_deleted_at: new Date() })])
      ).toBe(true)
    })

    it("one live link to a live variant rescues the item (mixed links)", () => {
      expect(
        isOrphanInventoryItem([
          link({ variant_exists: false }),
          link({ variant_deleted_at: new Date() }),
          link({}),
        ])
      ).toBe(false)
    })

    it("accepts ISO-string deleted_at values (as Knex commonly returns)", () => {
      expect(
        isOrphanInventoryItem([
          link({ variant_deleted_at: "2026-05-13T00:00:00.000Z" }),
        ])
      ).toBe(true)
    })
  })

  describe("isLiveLinkToLiveVariant", () => {
    it.each([
      [{}, true],
      [{ link_deleted_at: new Date() }, false],
      [{ variant_exists: false }, false],
      [{ variant_deleted_at: new Date() }, false],
    ])("link=%j -> live=%s", (overrides, expected) => {
      expect(isLiveLinkToLiveVariant(link(overrides as any))).toBe(expected)
    })
  })
})
