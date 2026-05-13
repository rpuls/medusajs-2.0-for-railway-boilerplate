import {
  downstreamStageFromAscolourStatus,
  isTerminalAscolourStatus,
  normalizeAscolourStatus,
  summarizeShipments,
} from "../ascolour-status"

describe("ascolour-status", () => {
  describe("normalizeAscolourStatus", () => {
    it("trims and lowercases", () => {
      expect(normalizeAscolourStatus("  Shipped  ")).toBe("shipped")
    })
    it("returns empty string for null/undefined", () => {
      expect(normalizeAscolourStatus(null)).toBe("")
      expect(normalizeAscolourStatus(undefined)).toBe("")
    })
  })

  describe("isTerminalAscolourStatus", () => {
    it.each([
      ["Shipped", true],
      ["shipped", true],
      ["Cancelled", true],
      ["Canceled", true],
      ["Complete", true],
      ["Delivered", true],
      ["Pending", false],
      ["Submitted", false],
      ["Picking", false],
      ["Packed", false],
      ["", false],
      [null, false],
      [undefined, false],
    ])("status %s -> terminal=%s", (input, expected) => {
      expect(isTerminalAscolourStatus(input as any)).toBe(expected)
    })
  })

  describe("downstreamStageFromAscolourStatus", () => {
    it("maps Shipped/Delivered to shipped", () => {
      expect(downstreamStageFromAscolourStatus("Shipped")).toBe("shipped")
      expect(downstreamStageFromAscolourStatus("delivered")).toBe("shipped")
    })
    it("returns null for non-shipped statuses", () => {
      expect(downstreamStageFromAscolourStatus("Pending")).toBeNull()
      expect(downstreamStageFromAscolourStatus("Cancelled")).toBeNull()
      expect(downstreamStageFromAscolourStatus(null)).toBeNull()
    })
  })

  describe("summarizeShipments", () => {
    it("returns empty array for null/undefined/non-array", () => {
      expect(summarizeShipments(null)).toEqual([])
      expect(summarizeShipments(undefined)).toEqual([])
      expect(summarizeShipments({} as any)).toEqual([])
    })
    it("filters out shipments with no tracking info or shippedAt", () => {
      const result = summarizeShipments([
        { trackingNumber: "ABC123", carrier: "Australia Post" },
        { carrier: "Aramex" },
        { shippedAt: "2026-05-13T00:00:00Z" },
      ])
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ trackingNumber: "ABC123", carrier: "Australia Post" })
      expect(result[1]).toMatchObject({ shippedAt: "2026-05-13T00:00:00Z" })
    })
  })
})
