import { sanitizeCustomizerDesignForCart } from "./sanitize-cart-metadata"

const longDataUrl = `data:image/png;base64,${"A".repeat(500)}`
const otherDataUrl = `data:image/png;base64,${"B".repeat(500)}`
const shortDataUrl = "data:image/png;base64,QUJD" // <240 chars, must pass through

describe("sanitizeCustomizerDesignForCart", () => {
  it("leaves short data URLs and non-data strings alone", () => {
    const out = sanitizeCustomizerDesignForCart({
      smallImage: shortDataUrl,
      label: "Front of shirt",
    })
    expect(out).toEqual({
      smallImage: shortDataUrl,
      label: "Front of shirt",
    })
  })

  it("replaces large data URLs with the placeholder when no override is provided", () => {
    const out = sanitizeCustomizerDesignForCart({ src: longDataUrl })
    expect(out).toEqual({ src: "[omitted-image-data]" })
  })

  it("swaps a known data URL for its hosted URL via the override map (the re-order fix)", () => {
    const hosted = "https://minio.example.com/uploads/abc.png"
    const out = sanitizeCustomizerDesignForCart(
      { src: longDataUrl },
      { [longDataUrl]: hosted }
    )
    expect(out).toEqual({ src: hosted })
  })

  it("falls back to the placeholder when the data URL is not in the override map", () => {
    const out = sanitizeCustomizerDesignForCart(
      { src: longDataUrl },
      { [otherDataUrl]: "https://elsewhere.example/file.png" }
    )
    expect(out).toEqual({ src: "[omitted-image-data]" })
  })

  it("walks nested arrays + objects (Fabric serialises sideLayouts as nested data)", () => {
    const hosted = "https://minio.example.com/uploads/abc.png"
    const out = sanitizeCustomizerDesignForCart(
      {
        sideLayouts: [
          {
            side: "front",
            objects: [
              {
                type: "image",
                src: longDataUrl,
                left: 100,
                top: 50,
              },
            ],
          },
          {
            side: "back",
            objects: [],
          },
        ],
      },
      { [longDataUrl]: hosted }
    )
    expect(out).toEqual({
      sideLayouts: [
        {
          side: "front",
          objects: [
            {
              type: "image",
              src: hosted,
              left: 100,
              top: 50,
            },
          ],
        },
        {
          side: "back",
          objects: [],
        },
      ],
    })
  })

  it("preserves non-string scalars (numbers, booleans, null)", () => {
    const out = sanitizeCustomizerDesignForCart({
      width: 600,
      visible: true,
      placeholder: null,
    })
    expect(out).toEqual({
      width: 600,
      visible: true,
      placeholder: null,
    })
  })
})
