import {
  catalogImagesUnoptimized,
  catalogSwatchBackgroundImageUrl,
} from "../catalog-image-url"

describe("catalogImagesUnoptimized", () => {
  const env = process.env

  afterEach(() => {
    process.env = env
  })

  it("returns true when NEXT_PUBLIC_UNOPTIMIZED_IMAGES is true", () => {
    process.env = { ...env, NEXT_PUBLIC_UNOPTIMIZED_IMAGES: "true", VERCEL: undefined }
    expect(catalogImagesUnoptimized()).toBe(true)
  })

  it("returns false when explicitly false even on Vercel", () => {
    process.env = {
      ...env,
      NEXT_PUBLIC_UNOPTIMIZED_IMAGES: "false",
      VERCEL: "1",
    }
    expect(catalogImagesUnoptimized()).toBe(false)
  })

  it("defaults to true on Vercel when env unset", () => {
    process.env = { ...env, NEXT_PUBLIC_UNOPTIMIZED_IMAGES: undefined, VERCEL: "1" }
    expect(catalogImagesUnoptimized()).toBe(true)
  })
})

describe("catalogSwatchBackgroundImageUrl", () => {
  const env = process.env
  const src = "https://cdn.example.com/swatch.jpg"

  afterEach(() => {
    process.env = env
  })

  it("returns the source URL when unoptimized", () => {
    process.env = { ...env, NEXT_PUBLIC_UNOPTIMIZED_IMAGES: "true" }
    expect(catalogSwatchBackgroundImageUrl(src)).toBe(src)
  })

  it("returns /_next/image with q=75 when optimized", () => {
    process.env = { ...env, NEXT_PUBLIC_UNOPTIMIZED_IMAGES: "false", VERCEL: undefined }
    expect(catalogSwatchBackgroundImageUrl(src)).toBe(
      `/_next/image?url=${encodeURIComponent(src)}&w=80&q=75`
    )
  })
})
