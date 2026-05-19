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
      matcher: "/admin/orders/:id/revised-proof",
      methods: ["POST"],
      bodyParser: { sizeLimit: "12mb" },
    },
    {
      matcher: "/admin/orders/:id/production-photos",
      methods: ["POST"],
      bodyParser: { sizeLimit: "12mb" },
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
    {
      // Stripe webhook for admin-created Payment Links. Stripe signs the raw
      // body, so we must preserve it for `stripe.webhooks.constructEvent`.
      matcher: "/hooks/stripe-payment-link",
      methods: ["POST"],
      bodyParser: {
        preserveRawBody: true,
        sizeLimit: "1mb",
      },
    },
    {
      // Resend webhook for bounce / spam-complaint / open / click events.
      // Svix signs the raw body — preserved verbatim for the signature
      // check in lib/resend-webhook.ts.
      matcher: "/hooks/resend",
      methods: ["POST"],
      bodyParser: {
        preserveRawBody: true,
        sizeLimit: "256kb",
      },
    },
  ],
})
