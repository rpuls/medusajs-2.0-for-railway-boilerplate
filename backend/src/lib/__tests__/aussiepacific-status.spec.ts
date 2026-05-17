import {
  downstreamStageFromAussiePacificStatus,
  isTerminalAussiePacificStatus,
  normalizeAussiePacificStatus,
  summarizeAussiePacificShipments,
} from "../aussiepacific-status"

describe("aussiepacific-status", () => {
  describe("normalizeAussiePacificStatus", () => {
    it("trims and lowercases", () => {
      expect(normalizeAussiePacificStatus("  Shipped  ")).toBe("shipped")
    })
    it("returns empty string for null/undefined", () => {
      expect(normalizeAussiePacificStatus(null)).toBe("")
      expect(normalizeAussiePacificStatus(undefined)).toBe("")
    })
  })

  describe("isTerminalAussiePacificStatus", () => {
    it.each([
      ["Shipped", true],
      ["shipped", true],
      ["Cancelled", true],
      ["Canceled", true],
      ["Complete", true],
      ["Delivered", true],
      ["Submitted", false],
      ["Pending", false],
      ["", false],
      [null, false],
      [undefined, false],
    ])("status %s -> terminal=%s", (input, expected) => {
      expect(isTerminalAussiePacificStatus(input as any)).toBe(expected)
    })
  })

  describe("downstreamStageFromAussiePacificStatus", () => {
    it("maps Shipped/Delivered to shipped", () => {
      expect(downstreamStageFromAussiePacificStatus("Shipped")).toBe("shipped")
      expect(downstreamStageFromAussiePacificStatus("delivered")).toBe("shipped")
    })
    it("returns null for non-terminal/non-shipped statuses", () => {
      expect(downstreamStageFromAussiePacificStatus("Submitted")).toBeNull()
      expect(downstreamStageFromAussiePacificStatus("Cancelled")).toBeNull()
      expect(downstreamStageFromAussiePacificStatus(null)).toBeNull()
    })
  })

  describe("summarizeAussiePacificShipments", () => {
    it("returns empty array for null/undefined/non-array", () => {
      expect(summarizeAussiePacificShipments(null)).toEqual([])
      expect(summarizeAussiePacificShipments(undefined)).toEqual([])
      expect(summarizeAussiePacificShipments({} as any)).toEqual([])
    })
    it("filters out shipments with no tracking info or shippedAt", () => {
      const result = summarizeAussiePacificShipments([
        { trackingNumber: "ABC123", carrier: "Australia Post" },
        { carrier: "Aramex" },
        { shippedAt: "2026-05-13T00:00:00Z" },
      ])
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        trackingNumber: "ABC123",
        carrier: "Australia Post",
      })
      expect(result[1]).toMatchObject({ shippedAt: "2026-05-13T00:00:00Z" })
    })
  })
})
