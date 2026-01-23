import { z } from "zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const GetBestSellersSchema = createFindParams().extend({
    category_ids: z.string().array().optional(),
    collection_id: z.string().optional(),
});

