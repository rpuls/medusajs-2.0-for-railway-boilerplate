import { z } from "zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const GetBestSellersSchema = createFindParams().extend({
    category_id: z.string().optional(),
    collection_id: z.string().optional(),
});

