import {
  inferDecorationMethodFromCustomizer,
  itemMethod,
} from "../reports/orders"

describe("itemMethod / inferDecorationMethodFromCustomizer", () => {
  it("uses decorationDesign.method when set", () => {
    expect(
      itemMethod({
        metadata: { decorationDesign: { method: "uv" } },
      })
    ).toBe("uv")
  })

  it("classifies SCP DTF customizer lines as dtf", () => {
    expect(
      itemMethod({
        metadata: {
          customizerDesign: {
            artifacts: [{ side: "front" }],
            pricing: {
              server: {
                mode: "scp_dtf",
                print_side_keys: ["front"],
              },
            },
          },
        },
      })
    ).toBe("dtf")
  })

  it("classifies embroidery-only customizer lines as embroidery", () => {
    expect(
      inferDecorationMethodFromCustomizer({
        sideDecorationMethods: { front: "embroidery" },
        pricing: {
          server: {
            mode: "scp_dtf_mixed",
            embroidery_side_keys: ["front"],
            print_side_keys: [],
          },
        },
      })
    ).toBe("embroidery")
  })

  it("classifies mixed print+embroidery customizer as dtf when print sides exist", () => {
    expect(
      inferDecorationMethodFromCustomizer({
        sideDecorationMethods: { front: "embroidery", back: "print" },
        pricing: {
          server: {
            mode: "scp_dtf_mixed",
            embroidery_side_keys: ["front"],
            print_side_keys: ["back"],
          },
        },
      })
    ).toBe("dtf")
  })

  it("defaults decorated customizer without server block to dtf", () => {
    expect(
      itemMethod({
        metadata: {
          customizerDesign: {
            prints: [{ objectId: "a", side: "front", sizeId: "up_to_a6" }],
          },
        },
      })
    ).toBe("dtf")
  })

  it("returns blank for plain garment lines", () => {
    expect(itemMethod({ metadata: {} })).toBe("blank")
  })
})
