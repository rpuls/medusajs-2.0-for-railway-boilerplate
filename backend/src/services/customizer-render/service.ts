import sharp from "sharp"
import { ulid } from "ulid"
import { Client } from "minio"
import { MedusaError } from "@medusajs/framework/utils"
import {
  BACKEND_URL,
  MINIO_ACCESS_KEY,
  MINIO_BUCKET,
  MINIO_ENDPOINT,
  MINIO_SECRET_KEY,
} from "../../lib/constants"
import { RenderRequestPayload } from "./types"

const DEFAULT_MOCKUP_SIZE = {
  width: 1200,
  height: 1500,
}

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^::1$/,
  /^fc/i,
  /^fd/i,
]

const clampDimension = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.floor(value)))

const isPrivateHost = (host: string) => PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))

export const validateGarmentImageUrl = (value: string) => {
  let parsed: URL

  try {
    parsed = new URL(value)
  } catch {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Garment image URL is invalid.")
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Only HTTP(S) garment image URLs are allowed."
    )
  }

  const host = parsed.hostname.toLowerCase()
  /** Local dev uses same-origin garment URLs (e.g. localhost sleeve placeholders); production should use public CDN URLs. */
  const isProduction = process.env.NODE_ENV === "production"
  const explicitPrivateOk =
    String(process.env.CUSTOMIZER_ALLOW_PRIVATE_GARMENT_URLS ?? "")
      .trim()
      .toLowerCase() === "true"
  const allowPrivateGarmentUrls = explicitPrivateOk || !isProduction

  if (!allowPrivateGarmentUrls && isPrivateHost(host)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Private or local network garment image URLs are not allowed."
    )
  }

  const allowedHosts = (process.env.CUSTOMIZER_GARMENT_IMAGE_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  if (allowedHosts.length && !allowedHosts.includes(host)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Garment image host is not in the allowed list."
    )
  }

  return parsed.toString()
}

export const rethrowIfMedusaError = (error: unknown) => {
  if (
    error instanceof MedusaError ||
    (typeof error === "object" &&
      error !== null &&
      (error as { name?: unknown }).name === "MedusaError" &&
      typeof (error as { message?: unknown }).message === "string")
  ) {
    throw error
  }
}

const getMinioConfig = () => {
  if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    return null
  }

  let endPoint = MINIO_ENDPOINT
  let useSSL = true
  let port = 443

  if (endPoint.startsWith("https://")) {
    endPoint = endPoint.replace("https://", "")
    useSSL = true
    port = 443
  } else if (endPoint.startsWith("http://")) {
    endPoint = endPoint.replace("http://", "")
    useSSL = false
    port = 80
  }

  endPoint = endPoint.replace(/\/$/, "")
  const portMatch = endPoint.match(/:(\d+)$/)
  if (portMatch) {
    port = parseInt(portMatch[1], 10)
    endPoint = endPoint.replace(/:(\d+)$/, "")
  }

  return {
    endPoint,
    useSSL,
    port,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    bucket: MINIO_BUCKET || "medusa-media",
  }
}

const uploadToMinio = async (buffer: Buffer, fileName: string, mimeType: string) => {
  const config = getMinioConfig()
  if (!config) {
    return null
  }

  const client = new Client({
    endPoint: config.endPoint,
    useSSL: config.useSSL,
    port: config.port,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
  })

  const key = `customizer/${fileName}`
  try {
    await client.putObject(config.bucket, key, buffer, buffer.length, {
      "Content-Type": mimeType,
      "x-amz-acl": "public-read",
    })
  } catch {
    // Storage misconfiguration should not block add-to-cart in local/dev flows.
    // Callers already fall back to compact inline data URLs when this returns null.
    return null
  }

  const protocol = config.useSSL ? "https" : "http"
  return `${protocol}://${config.endPoint}/${config.bucket}/${key}`
}

const dataUrlFromBuffer = (buffer: Buffer, mimeType: string) =>
  `data:${mimeType};base64,${buffer.toString("base64")}`

/**
 * Fabric `toSVG()` plus Sharp density can yield a bitmap not exactly matching the editor canvas;
 * normalize so placement pixels match the storefront.
 */
const rasterizeCustomizerSvgToCanvas = async (
  svgBuffer: Buffer,
  canvas?: { width: number; height: number }
): Promise<{ buffer: Buffer; width: number; height: number }> => {
  let buf = await sharp(svgBuffer, { density: 144 }).ensureAlpha().png().toBuffer()
  let meta = await sharp(buf).metadata()
  let w = meta.width ?? 0
  let h = meta.height ?? 0

  if (
    canvas?.width &&
    canvas?.height &&
    (w !== canvas.width || h !== canvas.height)
  ) {
    buf = await sharp(buf)
      .resize(canvas.width, canvas.height)
      .png()
      .toBuffer()
    meta = await sharp(buf).metadata()
    w = meta.width ?? canvas.width
    h = meta.height ?? canvas.height
  }

  if (!w || !h) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Customizer SVG did not rasterize to a valid bitmap."
    )
  }

  return { buffer: buf, width: w, height: h }
}

/** Hex `#RRGGBB` → {r,g,b}; null on malformed input. */
const parseHex = (hex: string): { r: number; g: number; b: number } | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const v = parseInt(m[1], 16)
  return { r: (v >> 16) & 0xff, g: (v >> 8) & 0xff, b: v & 0xff }
}

/**
 * Recolour a generic white sleeve placeholder so the final mockup picks up
 * the garment colour. Replicates the storefront's CSS effect (canvas-stage):
 *
 *   - Light tint  → "multiply" the tint into every pixel. White body picks
 *                   up the tint, dark line work stays dark.
 *   - Dark tint   → invert the placeholder, then take pixel-wise max with
 *                   the tint (equivalent to `lighten` blend with `filter:
 *                   invert(1)`). Body becomes the dark tint colour, lines
 *                   render bright so they're still readable.
 *
 * Luminance threshold of 0.4 (Rec.709) matches the storefront so the preview
 * and the rendered mockup agree on which branch was taken.
 */
const tintSleevePlaceholder = async (
  placeholderBuf: Buffer,
  hex: string
): Promise<Buffer> => {
  const tint = parseHex(hex)
  if (!tint) return placeholderBuf

  const { data, info } = await sharp(placeholderBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = info.width * info.height
  const out = Buffer.from(data)

  const lum = (0.2126 * tint.r + 0.7152 * tint.g + 0.0722 * tint.b) / 255
  const isDark = lum < 0.4

  for (let i = 0; i < pixels; i++) {
    const off = i * 4
    const r = data[off]
    const g = data[off + 1]
    const b = data[off + 2]
    if (isDark) {
      // invert + lighten(tint, inverted)
      out[off] = Math.max(tint.r, 255 - r)
      out[off + 1] = Math.max(tint.g, 255 - g)
      out[off + 2] = Math.max(tint.b, 255 - b)
    } else {
      // multiply(tint, original)
      out[off] = Math.round((tint.r * r) / 255)
      out[off + 1] = Math.round((tint.g * g) / 255)
      out[off + 2] = Math.round((tint.b * b) / 255)
    }
    // alpha unchanged
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

// Matches CanvasStage: scale(3.2) with transform-origin: 50% 14%
const TAG_ZOOM_SCALE = 3.2
const TAG_ORIGIN_X = 0.5
const TAG_ORIGIN_Y = 0.14

/**
 * For `printed_tag` the storefront zooms the garment image (CSS scale(3.2),
 * transform-origin: 50% 14%) while leaving the Fabric canvas unscaled. The
 * backend must replicate that crop so the artwork composite lands in the same
 * relative position. Steps:
 *   1. Apply object-cover (garmentCoverMatchCanvas) to get W×H.
 *   2. Crop the tag-visible region: top-left (originX - 1/(2*scale), originY*(1-1/scale)),
 *      size W/scale × H/scale.
 *   3. Resize the crop back to W×H.
 */
const garmentTagViewMatchCanvas = async (
  garmentBuffer: Buffer,
  viewportWidth: number,
  viewportHeight: number
): Promise<Buffer> => {
  // Step 1: object-cover crop
  const covered = await garmentCoverMatchCanvas(garmentBuffer, viewportWidth, viewportHeight)

  // Step 2: tag crop (exact inverse of the CSS transform)
  const cropLeft = Math.round((TAG_ORIGIN_X - 1 / (2 * TAG_ZOOM_SCALE)) * viewportWidth)
  const cropTop = Math.round(TAG_ORIGIN_Y * (1 - 1 / TAG_ZOOM_SCALE) * viewportHeight)
  const cropWidth = Math.round(viewportWidth / TAG_ZOOM_SCALE)
  const cropHeight = Math.round(viewportHeight / TAG_ZOOM_SCALE)

  // Clamp to safe bounds
  const left = Math.max(0, cropLeft)
  const top = Math.max(0, cropTop)
  const width = Math.min(cropWidth, viewportWidth - left)
  const height = Math.min(cropHeight, viewportHeight - top)

  // Step 3: resize back to canvas dimensions
  return sharp(covered)
    .extract({ left, top, width, height })
    .resize(viewportWidth, viewportHeight)
    .png()
    .toBuffer()
}

/**
 * Mirrors CSS `object-fit: cover`: center crop then resize to viewport (same as storefront img).
 */
const garmentCoverMatchCanvas = async (
  garmentBuffer: Buffer,
  viewportWidth: number,
  viewportHeight: number
) => {
  const meta = await sharp(garmentBuffer).metadata()
  const iw = meta.width ?? viewportWidth
  const ih = meta.height ?? viewportHeight
  if (iw < 1 || ih < 1) {
    return sharp(garmentBuffer).resize(viewportWidth, viewportHeight).png().toBuffer()
  }

  const scale = Math.max(viewportWidth / iw, viewportHeight / ih)
  let extractWidth = Math.floor(viewportWidth / scale)
  let extractHeight = Math.floor(viewportHeight / scale)
  extractWidth = Math.min(extractWidth, iw)
  extractHeight = Math.min(extractHeight, ih)

  let left = Math.floor((iw - extractWidth) / 2)
  let top = Math.floor((ih - extractHeight) / 2)
  left = clampDimension(left, 0, Math.max(0, iw - 1))
  top = clampDimension(top, 0, Math.max(0, ih - 1))
  extractWidth = Math.min(extractWidth, iw - left)
  extractHeight = Math.min(extractHeight, ih - top)

  return sharp(garmentBuffer)
    .extract({ left, top, width: extractWidth, height: extractHeight })
    .resize(viewportWidth, viewportHeight)
    .png()
    .toBuffer()
}

export const renderPrintAsset = async (payload: RenderRequestPayload) => {
  const svgBuffer = Buffer.from(payload.artworkSvg)
  const { buffer: fullPng, width: imgW, height: imgH } = await rasterizeCustomizerSvgToCanvas(
    svgBuffer,
    payload.canvas
  )

  const alphaSource = await sharp(fullPng).ensureAlpha().png().toBuffer()

  /**
   * Production file: tight crop around opaque pixels (not the dashed print-area box unless needed).
   * Some SVG → PNG paths paint an opaque white full-canvas bleed; `.trim()` would then refuse to shrink.
   * In that case we fall back to the print rectangle from the payload + trim inside that.
   */
  let printBuffer: Buffer
  try {
    printBuffer = await sharp(alphaSource)
      .trim({ threshold: 8, lineArt: true })
      .png({ compressionLevel: 9 })
      .toBuffer()
  } catch {
    printBuffer = alphaSource
  }

  const boxMeta = await sharp(printBuffer).metadata()
  const stillFullBleed =
    boxMeta.width &&
    boxMeta.height &&
    imgW > 50 &&
    imgH > 50 &&
    boxMeta.width >= Math.floor(imgW * 0.9) &&
    boxMeta.height >= Math.floor(imgH * 0.9)

  if (printBuffer.length < 80 || stillFullBleed) {
    const px = clampDimension(Math.floor(payload.placement.x), 0, Math.max(0, imgW - 1))
    const py = clampDimension(Math.floor(payload.placement.y), 0, Math.max(0, imgH - 1))
    const maxW = Math.max(1, imgW - px)
    const maxH = Math.max(1, imgH - py)
    const ew = clampDimension(Math.round(payload.placement.width), 1, Math.min(maxW, 4000))
    const eh = clampDimension(Math.round(payload.placement.height), 1, Math.min(maxH, 4000))
    printBuffer = await sharp(alphaSource)
      .extract({ left: px, top: py, width: ew, height: eh })
      .ensureAlpha()
      .trim({ threshold: 16, lineArt: true })
      .png({ compressionLevel: 9 })
      .toBuffer()
  }

  const outMeta = await sharp(printBuffer).metadata()

  const fileName = `print-${payload.side}-${ulid()}.png`
  const minioUrl = await uploadToMinio(printBuffer, fileName, "image/png")

  return {
    url: minioUrl ?? dataUrlFromBuffer(printBuffer, "image/png"),
    bytes: printBuffer.length,
    width: outMeta.width ?? 0,
    height: outMeta.height ?? 0,
  }
}

export const renderMockupAsset = async (payload: RenderRequestPayload) => {
  const artworkSvgBuffer = Buffer.from(payload.artworkSvg)

  /**
   * Full-canvas PNG (same WxH as the Fabric editor): composite at (0,0) onto the garment bitmap
   * that matches CSS `object-cover`, so logos land exactly where users position them — no slicing
   * + re-placing artwork with error-prone x/y bookkeeping.
   */
  const { buffer: overlayRaw } = await rasterizeCustomizerSvgToCanvas(
    artworkSvgBuffer,
    payload.canvas
  )
  const fullOverlay = await sharp(overlayRaw).ensureAlpha().png().toBuffer()

  const canvasDims = payload.canvas
  let mockupWidth: number
  let mockupHeight: number

  let garmentBase: Buffer
  if (payload.garmentImageUrl) {
    try {
      const garmentImageUrl = validateGarmentImageUrl(payload.garmentImageUrl)
      const response = await fetch(garmentImageUrl)
      if (!response.ok) {
        throw new Error(`Garment source returned ${response.status}`)
      }

      const contentType = response.headers.get("content-type") ?? ""
      if (!contentType.startsWith("image/")) {
        throw new Error("Garment source did not return an image payload")
      }

      const arrayBuffer = await response.arrayBuffer()
      let rawGarment = Buffer.from(arrayBuffer)
      if (canvasDims?.width && canvasDims?.height) {
        garmentBase =
          payload.side === "printed_tag"
            ? await garmentTagViewMatchCanvas(rawGarment, canvasDims.width, canvasDims.height)
            : await garmentCoverMatchCanvas(rawGarment, canvasDims.width, canvasDims.height)
        mockupWidth = canvasDims.width
        mockupHeight = canvasDims.height
      } else {
        const gm = await sharp(rawGarment).metadata()
        mockupWidth = gm.width ?? DEFAULT_MOCKUP_SIZE.width
        mockupHeight = gm.height ?? DEFAULT_MOCKUP_SIZE.height
        garmentBase = rawGarment
      }
    } catch (error) {
      rethrowIfMedusaError(error)

      mockupWidth = canvasDims?.width ?? DEFAULT_MOCKUP_SIZE.width
      mockupHeight = canvasDims?.height ?? DEFAULT_MOCKUP_SIZE.height

      garmentBase = await sharp({
        create: {
          width: mockupWidth,
          height: mockupHeight,
          channels: 4,
          background: "#f3f4f6",
        },
      })
        .png()
        .toBuffer()
    }
  } else {
    mockupWidth = canvasDims?.width ?? DEFAULT_MOCKUP_SIZE.width
    mockupHeight = canvasDims?.height ?? DEFAULT_MOCKUP_SIZE.height

    garmentBase = await sharp({
      create: {
        width: mockupWidth,
        height: mockupHeight,
        channels: 4,
        background: "#f3f4f6",
      },
    })
      .png()
      .toBuffer()
  }

  if (!(payload.garmentImageUrl && canvasDims?.width && canvasDims?.height)) {
    const garmentMeta = await sharp(garmentBase).metadata()
    mockupWidth = garmentMeta.width ?? mockupWidth
    mockupHeight = garmentMeta.height ?? mockupHeight
  }

  // Recolour the generic sleeve placeholder so the rendered mockup picks up
  // the variant colour (storefront preview already does this via CSS).
  // No-op for non-sleeve sides or when the storefront couldn't sample a tint.
  if (
    payload.tintColor &&
    (payload.side === "left_sleeve" || payload.side === "right_sleeve")
  ) {
    try {
      garmentBase = await tintSleevePlaceholder(garmentBase, payload.tintColor)
    } catch {
      // Tinting is best-effort — fall back to the uncoloured placeholder.
    }
  }

  const overlayMeta = await sharp(fullOverlay).metadata()
  let overlayBuf = fullOverlay
  if (
    canvasDims?.width &&
    canvasDims?.height &&
    (overlayMeta.width !== mockupWidth || overlayMeta.height !== mockupHeight)
  ) {
    overlayBuf = await sharp(fullOverlay)
      .resize(mockupWidth, mockupHeight)
      .png()
      .toBuffer()
  }

  const mockupBuffer = await sharp(garmentBase)
    .composite([
      {
        input: overlayBuf,
        left: 0,
        top: 0,
        blend: "over",
      },
    ])
    .jpeg({ quality: 82 })
    .toBuffer()

  const fileName = `mockup-${payload.side}-${ulid()}.jpg`
  const minioUrl = await uploadToMinio(mockupBuffer, fileName, "image/jpeg")

  return {
    url: minioUrl ?? dataUrlFromBuffer(mockupBuffer, "image/jpeg"),
    bytes: mockupBuffer.length,
    width: mockupWidth,
    height: mockupHeight,
    source: BACKEND_URL,
  }
}
