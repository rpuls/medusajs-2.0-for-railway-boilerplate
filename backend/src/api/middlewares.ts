import { defineMiddlewares } from "@medusajs/framework/http"

/**
 * Default Express JSON limit is ~100kb; customizer render payloads include
 * base64 image data and exceed that. Without this, Medusa logs
 * "request entity too large" and returns 500 for render-print / render-mockup.
 */
const CUSTOMIZER_BODY_LIMIT = "32mb"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/customizer/render-print",
      methods: ["POST"],
      bodyParser: { sizeLimit: CUSTOMIZER_BODY_LIMIT },
    },
    {
      matcher: "/store/customizer/render-mockup",
      methods: ["POST"],
      bodyParser: { sizeLimit: CUSTOMIZER_BODY_LIMIT },
    },
    {
      matcher: "/store/customizer/upload-original",
      methods: ["POST"],
      bodyParser: { sizeLimit: CUSTOMIZER_BODY_LIMIT },
    },
    {
      matcher: "/store/carts/:id/scp-line-items",
      methods: ["POST"],
      bodyParser: { sizeLimit: "4mb" },
    },
    {
      matcher: "/store/carts/:id/embroidery-line-items",
      methods: ["POST"],
      bodyParser: { sizeLimit: "4mb" },
    },
    {
      // ShipStation v2 webhook endpoint. Preserve the raw request body so we
      // can verify the HMAC-SHA256 signature header.
      matcher: "/hooks/shipstation",
      methods: ["POST"],
      bodyParser: {
        preserveRawBody: true,
        sizeLimit: "1mb",
      },
    },
  ],
})
