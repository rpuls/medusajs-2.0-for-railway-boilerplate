import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

import {
  CreateStoreInput,
  createStoreWorkflow,
} from "../../workflows/create-store";

export async function POST(
  req: MedusaRequest<CreateStoreInput>,
  res: MedusaResponse
): Promise<void> {
  const { result } = await createStoreWorkflow(req.scope).run({
    input: req.body,
  });
  res.json({
    message: "Ok",
  });
}
