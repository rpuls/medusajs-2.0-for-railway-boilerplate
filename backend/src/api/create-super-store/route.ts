import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

import {
  CreateStoreInput,
  createStoreWorkflow,
} from "../../workflows/create-store";
import { SUPER_ADMIN_STORE_NAME } from "src/constants";

// curl -X POST http://localhost:9000/create-super-store -d '{ "email":"admin1@test.com", "password": "123"}' -H 'Content-Type: application/json' -H 'Authorization: 123'

export async function POST(
  req: MedusaRequest<CreateStoreInput>,
  res: MedusaResponse
): Promise<void> {
  const { result } = await createStoreWorkflow(req.scope).run({
    input: {
      ...req.body,
      is_super_admin: true,
      store_name: SUPER_ADMIN_STORE_NAME,
    },
  });
  res.json({
    message: "Ok",
  });
}
