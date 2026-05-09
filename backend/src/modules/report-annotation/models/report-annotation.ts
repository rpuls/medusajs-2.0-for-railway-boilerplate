import { model } from "@medusajs/framework/utils"

/**
 * Operator-curated note pinned to a date on the Reports time-series. Lets
 * the team annotate "Black Friday weekend", "AS Colour delay Apr 15",
 * "site relaunch" so future-you reads patterns instead of staring at
 * unexplained spikes / dips.
 *
 * Kept intentionally tiny — date + label + color + optional description.
 * No category, no tags, no per-chart restriction. Annotations apply to
 * every time-series chart that opts in to render the overlay.
 */
const ReportAnnotation = model
  .define("report_annotation", {
    id: model.id({ prefix: "ann" }).primaryKey(),
    /** ISO date (YYYY-MM-DD); time component ignored for display. */
    date: model.text(),
    label: model.text(),
    /** Free-form description, optional. */
    description: model.text().nullable(),
    /** Palette key — slate / teal / amber / rose. Defaults to slate. */
    color: model.text().default("slate"),
  })
  .indexes([
    {
      on: ["date"],
    },
  ])

export default ReportAnnotation
