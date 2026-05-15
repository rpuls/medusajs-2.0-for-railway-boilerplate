import { MedusaService } from "@medusajs/framework/utils"

import Quote from "./models/quote"
import QuoteEvent from "./models/quote-event"

class QuoteModuleService extends MedusaService({
  Quote,
  QuoteEvent,
}) {}

export default QuoteModuleService
