/**
 * Sample particle positions from a wordmark image's alpha channel.
 *
 * Loads the image, draws it onto an offscreen canvas, walks the pixels, and
 * returns one (x, y) per opaque pixel above the alpha threshold. The Three.js
 * particle scene then picks N of these as home positions and colors them via
 * the gradient axis projection.
 */
export type StipplePoint = {
  x: number
  y: number
  u: number
  v: number
  /** Normalised RGB (0–1) sampled from the source image. Only present when
   * `sampleColors = true` is passed to `sampleWordmarkStipple`. */
  r?: number
  g?: number
  b?: number
}

export async function sampleWordmarkStipple(
  src: string,
  /** Render size of the offscreen canvas — controls stipple density.
   * 1024 = ~50-150k candidates depending on logo coverage. */
  renderSize = 1024,
  alphaThreshold = 128,
  /** When true, sample the RGB of each pixel and store it on the point as
   * normalised r/g/b (0–1). Used for photo-coloured particle clouds. */
  sampleColors = false
): Promise<{
  points: StipplePoint[]
  width: number
  height: number
}> {
  const img = await loadImage(src)
  const aspect = img.naturalWidth / img.naturalHeight
  const width =
    aspect >= 1 ? renderSize : Math.round(renderSize * aspect)
  const height =
    aspect >= 1 ? Math.round(renderSize / aspect) : renderSize

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d", { alpha: true })
  if (!ctx) {
    throw new Error("[sampleWordmarkStipple] failed to get 2d context")
  }
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  let imageData: ImageData
  try {
    imageData = ctx.getImageData(0, 0, width, height)
  } catch (e) {
    throw new Error(`[sampleWordmarkStipple] getImageData failed: ${String(e)}`)
  }
  const data = imageData.data
  const points: StipplePoint[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const base = (y * width + x) * 4
      const a = data[base + 3]!
      if (a > alphaThreshold) {
        const pt: StipplePoint = { x, y, u: x / width, v: y / height }
        if (sampleColors) {
          pt.r = data[base]! / 255
          pt.g = data[base + 1]! / 255
          pt.b = data[base + 2]! / 255
        }
        points.push(pt)
      }
    }
  }
  return { points, width, height }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}
