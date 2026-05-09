import { model } from "@medusajs/framework/utils"

/**
 * Top-of-page status banner. Used for short ops messages: "AS Colour
 * API down — orders queuing locally", "Site maintenance Sunday 2am",
 * "Reports load slowly while we re-index".
 *
 * Currently active = expires_at is null OR in the future. Latest
 * (created_at desc) wins — the page only shows one banner at a time.
 */
const StatusBanner = model
  .define("status_banner", {
    id: model.id({ prefix: "bnr" }).primaryKey(),
    body: model.text(),
    /** One of: info / warning / critical — drives the colour. */
    severity: model.text().default("info"),
    /** ISO timestamp; null = active forever (until manually deleted). */
    expires_at: model.text().nullable(),
    created_by: model.text().nullable(),
  })
  .indexes([{ on: ["expires_at"] }])

export default StatusBanner
