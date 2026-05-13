/**
 * AS Colour pricing helpers. The actual ladder math now lives in the shared
 * `backend/src/utils/bulk-price-ladder.ts` so the FashionBiz importer (and
 * any future suppliers that ingest a single wholesale cost per SKU) can
 * reuse it without copy-pasting the formula.
 */
export {
  buildPriceLadder,
  buildBulkPricingMetadata,
  toMinorAud,
} from "../../utils/bulk-price-ladder"

export type { PriceLadder } from "../../utils/bulk-price-ladder"
