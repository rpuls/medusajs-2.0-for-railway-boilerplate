import { ImageResponse } from "next/og"

import { getStoreName } from "@lib/util/env"

/**
 * The link preview card, generated per store.
 *
 * Next treats a file named `opengraph-image` in `app/` as a metadata route and
 * emits `<meta property="og:image">` for it automatically. Nothing imports this
 * file; the filename alone wires it up. It is what unfurls when a shopper
 * pastes a shop's URL into Slack, iMessage, WhatsApp, Facebook or LinkedIn.
 *
 * It replaces the `opengraph-image.jpg` that shipped with the Medusa Next.js
 * starter, which was the same picture on every deployed store: the Medusa and
 * Next.js logos over the words "Next.js Starter Template", beside a browser
 * mockup whose address bar read next.medusajs.com. Every merchant who shared a
 * link was advertising someone else's demo site, with their own brand nowhere
 * on it.
 *
 * Generating it instead of shipping a static file means each deploy gets its
 * own name on the card, which one shared placeholder image could never do.
 *
 * Twitter and X have no dedicated `twitter-image` here on purpose. Both fall
 * back to `og:image`, so a second near-identical file would only be a second
 * thing to keep in sync.
 */
export const alt = "Online store"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/*
 * Deliberately no webfont.
 *
 * ImageResponse can load a custom face, but only by fetching it at render time.
 * That puts a network call on the critical path of a route whose whole job is
 * to be scraped by someone else's crawler, and a slow or failed fetch takes the
 * card down rather than degrading it. The system stack renders everywhere and
 * cannot fail.
 */
const FONT = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, sans-serif"

export default async function OpengraphImage() {
  const storeName = getStoreName()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f1115",
          color: "#ffffff",
          fontFamily: FONT,
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8b93a7",
          }}
        >
          Online store
        </div>

        {/*
         * The store's own name is the whole point of generating this. Long
         * names wrap rather than overflow, and the size is chosen so a
         * two-line name still clears the footer.
         */}
        <div
          style={{
            display: "flex",
            fontSize: storeName.length > 22 ? 84 : 108,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: "100%",
          }}
        >
          {storeName}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 8,
              borderRadius: 4,
              background: "#0090cc",
            }}
          />
          <div style={{ display: "flex", fontSize: 30, color: "#8b93a7" }}>
            Shop online
          </div>
        </div>
      </div>
    ),
    size
  )
}
